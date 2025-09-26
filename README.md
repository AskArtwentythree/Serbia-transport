# Serbia-transport

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn package manager
- Browser with Web3 wallet (MetaMask recommended)

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone [your-repo-link]
   cd mobility-mvp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Blockchain (Optional)**

   - Copy contents from `contracts/Escrow.sol` to [Remix IDE](https://remix.ethereum.org)
   - Deploy to Polygon Amoy testnet via MetaMask
   - Update `src/crypto.js` with your deployed escrow contract address

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:5173`
   - The app will load in development mode with hot reload

## Technology Stack

- **Frontend**: React 19, Vite, React-Router
- **Mapping**: React-Leaflet, OpenStreetMap
- **Blockchain**: Ethers.js, Web3Modal
- **State Management**: React Hooks

## Blockchain payments (testnet)

This project includes a simple crypto checkout and escrow flow.

### What is included

- Wallet connect and USDC transfer on Polygon Amoy testnet.
- Escrow smart contract in `contracts/Escrow.sol` that splits funds 40/40/20 (Partner/Platform/City).
- Frontend actions in `src/Payment.jsx`:
  - Direct USDC transfer ("Pay with USDC").
  - Escrow payment creation (approve + createPayment).
  - Release and Refund buttons for admins/demo.

### How to deploy the Escrow contract with Remix

1. Open `https://remix.ethereum.org` and create a new file `Escrow.sol`.
2. Copy contents from `contracts/Escrow.sol`.
3. Compile with Solidity `0.8.20`.
4. In "Deploy & Run", select "Injected Provider" and connect MetaMask on Polygon Amoy.
5. Provide constructor params:
   - `_token`: USDC test token `NETWORKS.polygonAmoy.usdc.address` from `src/crypto.js`.
   - `_platformTreasury`: your platform wallet address.
   - `_cityTreasury`: a treasury wallet for the city (or your second wallet for demo).
6. Deploy and copy the contract address.
7. Update `src/crypto.js` → `NETWORKS.polygonAmoy.escrow.address` with the deployed address.
8. Restart the app if running.

### How to test

1. Get Amoy MATIC from a faucet to pay gas.
2. Get test USDC for Amoy (any faucet) and hold it in your wallet.
3. Open the app → Payments page.
4. Connect wallet and ensure network is Polygon Amoy.
5. Enter amount (e.g., `10`) and either:
   - Press "Pay with USDC" for direct transfer, or
   - Press "Pay to ESCROW" to create an escrow payment (approve + createPayment). Optionally set an Order ID.
6. Use "Release funds" or "Refund" with the same Order ID to settle.

### Development Notes

- All transport data is simulated using Belgrade-specific mock data
- OSRM routing requires stable internet connection for real-time calculations
- Blockchain features require testnet tokens (Polygon Amoy MATIC + USDC)
- DID authentication uses localStorage - data persists in browser session only
