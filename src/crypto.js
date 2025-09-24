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
      address: "0xf3278492a9b9A22bB2A6E2AA50732aA0B9c24e83", // community USDC (test token)
      decimals: 6,
      symbol: "USDC",
    },
    // Set these after deploying Escrow in Remix
    escrow: {
      address: "0x0000000000000000000000000000000000000000",
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
  "event Transfer(address indexed from, address indexed to, uint256 amount)",
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


