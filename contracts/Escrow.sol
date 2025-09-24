// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/**
 * Simple escrow for stablecoin payments with 40/40/20 split
 * - Buyer calls createPayment(orderId, partner, amount) after approving tokens
 * - Platform or Buyer can release (for MVP); funds are split to Partner/Platform/City treasuries
 * - Platform can refund to Buyer
 */
contract Escrow {
    enum Status { None, Pending, Released, Refunded }

    struct Payment {
        address buyer;
        address partner;
        uint256 amount;
        Status status;
    }

    IERC20 public immutable token; // e.g., USDC on testnet
    address public immutable platformTreasury;
    address public immutable cityTreasury;

    // Basis points: 10000 = 100%
    uint16 public constant PARTNER_BP = 4000; // 40%
    uint16 public constant PLATFORM_BP = 4000; // 40%
    uint16 public constant CITY_BP = 2000; // 20%

    mapping(bytes32 => Payment) public payments; // orderId => payment

    event PaymentCreated(bytes32 indexed orderId, address indexed buyer, address indexed partner, uint256 amount);
    event Released(bytes32 indexed orderId, uint256 partnerAmount, uint256 platformAmount, uint256 cityAmount);
    event Refunded(bytes32 indexed orderId, uint256 amount);

    modifier onlyPlatform() {
        require(msg.sender == platformTreasury, "only platform");
        _;
    }

    constructor(address _token, address _platformTreasury, address _cityTreasury) {
        require(_token != address(0) && _platformTreasury != address(0) && _cityTreasury != address(0), "zero");
        token = IERC20(_token);
        platformTreasury = _platformTreasury;
        cityTreasury = _cityTreasury;
    }

    function createPayment(bytes32 orderId, address partner, uint256 amount) external {
        require(partner != address(0) && amount > 0, "bad args");
        Payment storage p = payments[orderId];
        require(p.status == Status.None, "exists");
        p.buyer = msg.sender;
        p.partner = partner;
        p.amount = amount;
        p.status = Status.Pending;
        // Pull tokens from buyer
        require(token.transferFrom(msg.sender, address(this), amount), "transferFrom fail");
        emit PaymentCreated(orderId, msg.sender, partner, amount);
    }

    function release(bytes32 orderId) external {
        Payment storage p = payments[orderId];
        require(p.status == Status.Pending, "not pending");
        require(msg.sender == platformTreasury || msg.sender == p.buyer, "not authorized");
        p.status = Status.Released;
        uint256 partnerAmount = (p.amount * PARTNER_BP) / 10000;
        uint256 platformAmount = (p.amount * PLATFORM_BP) / 10000;
        uint256 cityAmount = p.amount - partnerAmount - platformAmount; // remainder to city
        require(token.transfer(p.partner, partnerAmount), "partner xfer");
        require(token.transfer(platformTreasury, platformAmount), "platform xfer");
        require(token.transfer(cityTreasury, cityAmount), "city xfer");
        emit Released(orderId, partnerAmount, platformAmount, cityAmount);
    }

    function refund(bytes32 orderId) external onlyPlatform {
        Payment storage p = payments[orderId];
        require(p.status == Status.Pending, "not pending");
        p.status = Status.Refunded;
        require(token.transfer(p.buyer, p.amount), "refund xfer");
        emit Refunded(orderId, p.amount);
    }

    function getPayment(bytes32 orderId) external view returns (Payment memory) {
        return payments[orderId];
    }
}


