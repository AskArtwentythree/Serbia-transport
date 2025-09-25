// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SimpleArbitratableEscrow
/// @notice A minimal, Remix-friendly ETH escrow with optional arbiter and dispute resolution
/// @dev Avoids external imports; includes a lightweight reentrancy guard
contract SimpleArbitratableEscrow {
    // --- ReentrancyGuard (lightweight) ---
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    uint256 private _reentrancyStatus;

    modifier nonReentrant() {
        require(_reentrancyStatus != ENTERED, "REENTRANCY");
        _reentrancyStatus = ENTERED;
        _;
        _reentrancyStatus = NOT_ENTERED;
    }

    // --- Types ---
    enum EscrowState {
        Created,
        Funded,
        Disputed,
        Released,
        Refunded,
        Cancelled
    }

    // --- Immutables ---
    address public immutable depositor;    // buyer
    address public immutable beneficiary;  // seller
    address public immutable arbiter;      // optional (can be address(0))
    uint256 public immutable priceWei;     // exact wei required to fund
    uint256 public immutable expirationTs; // optional: 0 = no expiry; otherwise unix timestamp

    // --- State ---
    EscrowState public state;
    uint256 public fundedAtTs; // timestamp when funded (0 if not funded)

    // --- Events ---
    event Funded(address indexed from, uint256 amount);
    event Released(address indexed to, uint256 amount);
    event Refunded(address indexed to, uint256 amount);
    event Disputed(address indexed by);
    event Resolved(address indexed byArbiter, bool toBeneficiary, uint256 amount);
    event Cancelled(address indexed by);

    // --- Errors ---
    error OnlyDepositor();
    error OnlyBeneficiary();
    error OnlyArbiter();
    error InvalidState();
    error InvalidValue();
    error AlreadyFunded();
    error PastExpiration();

    // --- Constructor ---
    /// @param _depositor buyer who funds the escrow
    /// @param _beneficiary seller who receives funds on release
    /// @param _arbiter optional third party who can resolve disputes (use address(0) for none)
    /// @param _priceWei exact wei that must be deposited via fund()
    /// @param _expirationTs unix timestamp after which depositor can refund if not released (0 to disable)
    constructor(
        address _depositor,
        address _beneficiary,
        address _arbiter,
        uint256 _priceWei,
        uint256 _expirationTs
    ) {
        require(_depositor != address(0) && _beneficiary != address(0), "ZERO_ADDR");
        require(_priceWei > 0, "ZERO_PRICE");
        depositor = _depositor;
        beneficiary = _beneficiary;
        arbiter = _arbiter; // may be zero (no arbiter)
        priceWei = _priceWei;
        expirationTs = _expirationTs; // may be zero (no expiration)
        state = EscrowState.Created;
        _reentrancyStatus = NOT_ENTERED;
    }

    // --- Modifiers ---
    modifier onlyDepositor() {
        if (msg.sender != depositor) revert OnlyDepositor();
        _;
    }

    modifier onlyBeneficiary() {
        if (msg.sender != beneficiary) revert OnlyBeneficiary();
        _;
    }

    modifier onlyArbiter() {
        if (msg.sender != arbiter || arbiter == address(0)) revert OnlyArbiter();
        _;
    }

    // --- Views ---
    function balance() public view returns (uint256) {
        return address(this).balance;
    }

    function isExpired() public view returns (bool) {
        return expirationTs != 0 && block.timestamp >= expirationTs;
    }

    // --- Core actions ---
    /// @notice Depositor funds the escrow with exactly priceWei
    function fund() external payable onlyDepositor nonReentrant {
        if (state != EscrowState.Created) revert InvalidState();
        if (msg.value != priceWei) revert InvalidValue();
        if (isExpired()) revert PastExpiration();

        state = EscrowState.Funded;
        fundedAtTs = block.timestamp;
        emit Funded(msg.sender, msg.value);
    }

    /// @notice Release funds to beneficiary
    /// @dev Callable by depositor or arbiter when funded
    function release() external nonReentrant {
        if (state != EscrowState.Funded && state != EscrowState.Disputed) revert InvalidState();
        bool authorized = (msg.sender == depositor) || (msg.sender == arbiter && arbiter != address(0));
        require(authorized, "NOT_AUTHORIZED");

        uint256 amount = address(this).balance;
        state = EscrowState.Released;
        _safeTransferETH(beneficiary, amount);
        emit Released(beneficiary, amount);
    }

    /// @notice Refund funds to depositor
    /// @dev Callable by beneficiary, arbiter, or depositor if expired and not released
    function refund() external nonReentrant {
        if (state != EscrowState.Funded && state != EscrowState.Disputed) revert InvalidState();
        bool canRefund = (msg.sender == beneficiary) || (msg.sender == arbiter && arbiter != address(0)) ||
            (msg.sender == depositor && isExpired());
        require(canRefund, "NOT_AUTHORIZED");

        uint256 amount = address(this).balance;
        state = EscrowState.Refunded;
        _safeTransferETH(depositor, amount);
        emit Refunded(depositor, amount);
    }

    /// @notice Either party can raise a dispute, moving state to Disputed
    function raiseDispute() external {
        if (state != EscrowState.Funded) revert InvalidState();
        require(msg.sender == depositor || msg.sender == beneficiary, "NOT_PARTY");
        state = EscrowState.Disputed;
        emit Disputed(msg.sender);
    }

    /// @notice Arbiter resolves a dispute to either party, optionally splitting via feeBps
    /// @param toBeneficiary true to send to seller, false to refund buyer
    /// @param feeBps optional fee in basis points (out of total balance) paid to arbiter; max 1000 bps
    function resolveDispute(bool toBeneficiary, uint256 feeBps) external nonReentrant onlyArbiter {
        if (state != EscrowState.Disputed) revert InvalidState();
        require(feeBps <= 1000, "FEE_TOO_HIGH"); // max 10%

        uint256 amount = address(this).balance;
        uint256 fee = (amount * feeBps) / 10_000;
        uint256 payout = amount - fee;

        state = toBeneficiary ? EscrowState.Released : EscrowState.Refunded;

        if (fee > 0) {
            _safeTransferETH(arbiter, fee);
        }

        address recipient = toBeneficiary ? beneficiary : depositor;
        _safeTransferETH(recipient, payout);
        emit Resolved(msg.sender, toBeneficiary, payout);
    }

    /// @notice Depositor can cancel the escrow before it is funded
    function cancelBeforeFund() external onlyDepositor {
        if (state != EscrowState.Created) revert InvalidState();
        state = EscrowState.Cancelled;
        emit Cancelled(msg.sender);
    }

    // --- Internal ETH transfer helper ---
    function _safeTransferETH(address to, uint256 amount) internal {
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "ETH_TRANSFER_FAIL");
    }

    // --- Receive / Fallback blocked ---
    receive() external payable {
        revert("DIRECT_SEND_DISABLED");
    }

    fallback() external payable {
        revert("FALLBACK_DISABLED");
    }
}


