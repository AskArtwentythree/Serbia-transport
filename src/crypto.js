// Minimal crypto helper for wallet payments (ethers v6)
import { BrowserProvider, Contract, parseUnits } from "ethers";

// Polygon Amoy testnet (recommended for demos) and Ethereum Sepolia as fallback
export const NETWORKS = {
  polygonAmoy: {
    chainId: 0x13882, // 80002
    name: "Polygon Amoy",
    rpcUrl: "https://rpc-amoy.polygon.technology",
    explorer: "https://www.oklink.com/amoy",
    usdc: {
      address: "0x8Da11E8Bbf81b4696F68e0FF89fD11C25BB11Cd4",
      decimals: 6,
      symbol: "USDC",
    },
    // Set these after deploying Escrow in Remix
    escrow: {
      address: "0x24Ea4392CDC8cB4e80dE6c45D9D1b66Ad0f24292", // Update this with your deployed contract address
      // Constructor parameters needed for Escrow.sol:
      // - _token: USDC address (0x8Da11E8Bbf81b4696F68e0FF89fD11C25BB11Cd4)
      // - _platformTreasury: Your platform wallet address
      // - _cityTreasury: City treasury wallet address
    },
  },
  sepolia: {
    chainId: 0xaa36a7, // 11155111
    name: "Sepolia",
    rpcUrl: "https://sepolia.drpc.org",
    explorer: "https://sepolia.etherscan.io",
  },
};

// Minimal ERC-20 ABI
export const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 amount)",
];

// Escrow contract ABI
export const ESCROW_ABI = [
  "function createPayment(bytes32 orderId, address partner, uint256 amount) external",
  "function release(bytes32 orderId) external",
  "function refund(bytes32 orderId) external",
  "function getPayment(bytes32 orderId) external view returns (tuple(address buyer, address partner, uint256 amount, uint8 status))",
  "event PaymentCreated(bytes32 indexed orderId, address indexed buyer, address indexed partner, uint256 amount)",
  "event Released(bytes32 indexed orderId, uint256 partnerAmount, uint256 platformAmount, uint256 cityAmount)",
  "event Refunded(bytes32 indexed orderId, uint256 amount)",
];

export async function getProvider() {
  if (!window.ethereum) throw new Error("Wallet not found. Install MetaMask.");
  return new BrowserProvider(window.ethereum);
}

export async function connectWallet() {
  const provider = await getProvider();
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const account = await signer.getAddress();
  const network = await provider.getNetwork();
  return { provider, signer, account, network };
}

export function formatAmountToUnits(amountStr, decimals) {
  const cleaned = String(amountStr).replace(/[^0-9.]/g, "");
  if (!cleaned) throw new Error("Amount is empty");
  return parseUnits(cleaned, decimals);
}

export async function erc20Transfer({ signer, token, to, amount, decimals }) {
  const contract = new Contract(token, ERC20_ABI, signer);
  const tx = await contract.transfer(to, amount);
  return await tx.wait();
}

export async function erc20Approve({ signer, token, spender, amount, decimals }) {
  const contract = new Contract(token, ERC20_ABI, signer);
  const tx = await contract.approve(spender, amount);
  return await tx.wait();
}

export async function erc20BalanceOf({ provider, token, address }) {
  const contract = new Contract(token, ERC20_ABI, provider);
  return await contract.balanceOf(address);
}

export async function erc20Allowance({ provider, token, owner, spender }) {
  const contract = new Contract(token, ERC20_ABI, provider);
  return await contract.allowance(owner, spender);
}

// Escrow functions
export async function createEscrowPayment({ signer, escrowAddress, orderId, partner, amount }) {
  const contract = new Contract(escrowAddress, ESCROW_ABI, signer);
  const tx = await contract.createPayment(orderId, partner, amount);
  return await tx.wait();
}

export async function releaseEscrowPayment({ signer, escrowAddress, orderId }) {
  const contract = new Contract(escrowAddress, ESCROW_ABI, signer);
  const tx = await contract.release(orderId);
  return await tx.wait();
}

export async function refundEscrowPayment({ signer, escrowAddress, orderId }) {
  const contract = new Contract(escrowAddress, ESCROW_ABI, signer);
  const tx = await contract.refund(orderId);
  return await tx.wait();
}

export async function getEscrowPayment({ provider, escrowAddress, orderId }) {
  const contract = new Contract(escrowAddress, ESCROW_ABI, provider);
  return await contract.getPayment(orderId);
}

// Helper to generate order ID
export function generateOrderId() {
  return `0x${Math.random().toString(16).substr(2, 8)}${Date.now().toString(16)}`;
}


