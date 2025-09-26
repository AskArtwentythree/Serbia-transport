import React, { useState } from "react";
import {
  connectWallet,
  NETWORKS,
  erc20Transfer,
  erc20Approve,
  createEscrowPayment,
  generateOrderId,
  formatAmountToUnits,
  getProvider,
} from "./crypto";
import { Contract } from "ethers";

export default function Payment() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    amount: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  // Web3 state
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [cryptoBusy, setCryptoBusy] = useState(false);
  const [cryptoMsg, setCryptoMsg] = useState("");
  const [orderId, setOrderId] = useState("");

  const preferred = NETWORKS.polygonAmoy;

  const ensurePreferredNetwork = async () => {
    const provider = await getProvider();
    const net = await provider.getNetwork();
    if (Number(net.chainId) === Number(preferred.chainId)) return true;
    try {
      await provider.send("wallet_switchEthereumChain", [
        { chainId: `0x${preferred.chainId.toString(16)}` },
      ]);
      return true;
    } catch (err) {
      // Try add network
      try {
        await provider.send("wallet_addEthereumChain", [
          {
            chainId: `0x${preferred.chainId.toString(16)}`,
            chainName: preferred.name,
            rpcUrls: [preferred.rpcUrl],
            nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
            blockExplorerUrls: [preferred.explorer],
          },
        ]);
        return true;
      } catch (e) {
        setCryptoMsg("Failed to switch network in wallet");
        return false;
      }
    }
  };

  // Enhanced network error recovery with retry logic
  const executeWithRetry = async (operation, maxRetries = 3, retryDelay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setCryptoMsg(`Operation attempt ${attempt}/${maxRetries}...`);
        return await operation();
      } catch (error) {
        console.log(`Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error; // Throw the last error
        }
        
        // Check if it's a network error that could benefit from retry
        const isNetworkError = error.code === -32603 || 
                               error.message?.includes("Internal JSON-RPC") ||
                               error.payload?.method === "eth_sendTransaction" ||
                               error.message?.includes("Internal JSON-RPC error");
        
        if (isNetworkError) {
          setCryptoMsg(`Network temporary issue ${attempt}/${maxRetries}, retrying in ${Math.round(retryDelay/1000)}s...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          // Increase delay for next iteration but cap it at 5 seconds
          retryDelay = Math.min(retryDelay * 1.3, 5000);
        } else {
          throw error; // Non-network errors shouldn't retry
        }
      }
    }
  };

  // Check network health to provide better diagnostics
  const checkNetworkHealth = async () => {
    try {
      const provider = await getProvider();
      const network = await provider.getNetwork();
      const currentBlock = await provider.getBlockNumber();
      
      if (Number(network.chainId) !== Number(preferred.chainId)) {
        setCryptoMsg(`Wrong network: Expected ${preferred.name} (Chain ID: ${preferred.chainId}) but got Chain ID: ${network.chainId}`);
        return false;
      }
      
      setCryptoMsg(`Network OK: ${preferred.name}, block ${currentBlock}`);
      return true;
    } catch (error) {
      setCryptoMsg(`Network health check failed: ${error.message}`);
      return false;
    }
  };

  const onConnectWallet = async () => {
    try {
      setCryptoBusy(true);
      const ok = await ensurePreferredNetwork();
      if (!ok) return;
      const { account: acc, network } = await connectWallet();
      setAccount(acc);
      setChainId(Number(network.chainId));
      setCryptoMsg("Wallet connected");
    } catch (e) {
      setCryptoMsg(e.message || "Wallet connection error");
    } finally {
      setCryptoBusy(false);
    }
  };

  const onCryptoPay = async () => {
    setResult(null);
    if (!account) {
      setCryptoMsg("Connect your wallet first");
      return;
    }
    const amountStr = form.amount;
    if (!amountStr) {
      setCryptoMsg("Enter amount before paying");
      return;
    }
    try {
      setCryptoBusy(true);
      await ensurePreferredNetwork();
      const { signer } = await connectWallet();
      const decimals = preferred.usdc.decimals;
      const amount = formatAmountToUnits(amountStr, decimals);
      const merchant = "0x000000000000000000000000000000000000dEaD"; // demo merchant address
      
      // Use retry mechanism for better success rate
      const receipt = await executeWithRetry(async () => {
        setCryptoMsg("Preparing USDC transaction...");
        return await erc20Transfer({ signer, token: preferred.usdc.address, to: merchant, amount, decimals });
      }, 2, 1500);
      
      setCryptoMsg(`Paid in blockchain. Hash: ${receipt.hash.slice(0, 10)}...`);
      setResult({ ok: true, message: "Crypto payment successful" });
    } catch (e) {
      console.error("USDC payment error:", e);
      let errorMessage = "Crypto payment error";
      try {
        if (e.code === -32603 || e.payload?.method === "eth_sendTransaction") {
          errorMessage = "Network error: Payment failed to submit. Try switching to a different network provider or retry later.";
        } else if (e.message) {
          errorMessage = e.message.replace(/execution reverted:|coalesce:/gi, "").trim();
        }
      } catch (parseError) {
        errorMessage = "Unknown payment error";
      }
      setCryptoMsg(errorMessage);
      setResult({ ok: false, message: errorMessage });
    } finally {
      setCryptoBusy(false);
    }
  };

  // ===== Escrow (approve + createPayment) =====
  const ESCROW_ABI = [
    "function createPayment(bytes32 orderId, address partner, uint256 amount)",
    "function release(bytes32 orderId)",
    "function refund(bytes32 orderId)",
    "function getPayment(bytes32 orderId) view returns (address buyer, address partner, uint256 amount, uint8 status)",
  ];

  // Helper function to consistently encode orderId to bytes32
  const encodeOrderId = (orderId) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(orderId);
    const hexString = Array.from(data)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return `0x${hexString.padEnd(64, "0").slice(0, 64)}`;
  };

  const onEscrowPay = async () => {
    setResult(null);
    if (!account) {
      setCryptoMsg("Connect your wallet first");
      return;
    }
    const amountStr = form.amount;
    const partner = prompt(
      "Enter partner address (rental service)",
      "0x000000000000000000000000000000000000dEaD"
    );
    if (!partner) return;
    try {
      setCryptoBusy(true);
      await ensurePreferredNetwork();
      const { signer } = await connectWallet();
      const decimals = preferred.usdc.decimals;
      const amount = formatAmountToUnits(amountStr, decimals);
      
      // Execute approve with retry mechanism
      await executeWithRetry(async () => {
        setCryptoMsg("Approve USDC spending...");
        await erc20Approve({
          signer,
          token: preferred.usdc.address,
          spender: NETWORKS.polygonAmoy.escrow.address,
          amount,
          decimals: preferred.usdc.decimals
        });
      }, 2, 1500); // 2 retries for faster UI
    
      // Execute escrow creation with retry mechanism
      await executeWithRetry(async () => {
        const escrow = new Contract(
          NETWORKS.polygonAmoy.escrow.address,
          ESCROW_ABI,
          signer
        );
        const id = orderId || crypto.randomUUID();
        const idBytes = encodeOrderId(id);
        setOrderId(id);
        setCryptoMsg("Creating escrow payment...");
        await (await escrow.createPayment(idBytes, partner, amount)).wait();
      }, 2, 1500);
      
      setCryptoMsg("Escrow created. Waiting for funds release.");
      setResult({ ok: true, message: "Escrow payment created" });
    } catch (e) {
      console.error("Escrow creation error:", e);
      let errorMessage = "Escrow creation error";
      try {
        // Handle JSON-RPC network errors specifically
        if (e.code === -32603 || e.payload?.method === "eth_sendTransaction") {
          errorMessage = "Network error: Transaction failed to submit. Try: 1) Wait and retry, 2) Switch network provider in MetaMask, 3) Check if you have enough MATIC for gas.";
        } else if (e.reason) {
          errorMessage = e.reason;
        } else if (e.message) {
          // Clean up JSON-RPC error messages
          if (e.message.includes("Internal JSON-RPC error")) {
            errorMessage = "Network provider issue: Please try switching network or retrying.";
          } else if (e.message.includes("coalesce") || e.message.includes("reverted")) {
            errorMessage = e.message.replace(/execution reverted:|coalesce:|Internal JSON-RPC error:/gi, "").trim();
          } else {
            errorMessage = e.message.replace(/execution reverted/gi, "").trim();
          }
        } else if (e.error?.error?.message) {
          errorMessage = e.error.error.message;
        }
      } catch (parseError) {
        errorMessage = "Unknown error during escrow creation";
      }
      setCryptoMsg(errorMessage);
      setResult({ ok: false, message: errorMessage });
    } finally {
      setCryptoBusy(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!orderId) {
      setCryptoMsg("Create an escrow payment first");
      return;
    }
    try {
      setCryptoBusy(true);
      setCryptoMsg("Checking payment status...");
      const { signer } = await connectWallet();
      const escrow = new Contract(
        NETWORKS.polygonAmoy.escrow.address,
        ESCROW_ABI,
        signer
      );
      const idBytes = encodeOrderId(orderId);
      
      // Get payment details
      const payment = await escrow.getPayment(idBytes);
      console.log("Payment details:", payment);
      
      // Check if payment exists (has non-zero buyer)
      if (payment.buyer === "0x0000000000000000000000000000000000000000") {
        setCryptoMsg("Error: Payment not found. Check that the order was created correctly.");
        return;
      }
      
      const statusMap = {
        0: "None",
        1: "Pending", 
        2: "Released",
        3: "Refunded"
      };
      
      // Convert status to number in case it's BigInt/string
      const statusNumber = Number(payment.status);
      const status = statusMap[statusNumber] || "Unknown";
      console.log("Payment status check - raw:", payment.status, "converted:", statusNumber, "mapped:", status);
      const currentAccount = await signer.getAddress();
      
      setCryptoMsg(`Status: ${status} (${statusNumber}) | Buyer: ${payment.buyer} | Your address: ${currentAccount} | Amount: ${payment.amount}`);
      
      // Check if current account can release
      const canRelease = currentAccount.toLowerCase() === payment.buyer.toLowerCase();
      const statusCheckResult = statusNumber === 1 ? "YES" : "NO";
      const releaseCheckResult = canRelease ? "YES" : "NO";
      setCryptoMsg(prev => prev + ` | Can release: ${releaseCheckResult} (Status Pending: ${statusCheckResult})`);
      
    } catch (e) {
      setCryptoMsg(e.shortMessage || e.message || "Status check error");
    } finally {
      setCryptoBusy(false);
    }
  };

  const onReleaseFunds = async () => {
    if (!orderId) {
      setCryptoMsg("Create an escrow payment first");
      return;
    }
    try {
      setCryptoBusy(true);
      setCryptoMsg("Releasing funds from escrow...");
      const { signer } = await connectWallet();
      const escrow = new Contract(
        NETWORKS.polygonAmoy.escrow.address,
        ESCROW_ABI,
        signer
      );
      const idBytes = encodeOrderId(orderId);
      
      // Check payment status first
      const payment = await escrow.getPayment(idBytes);
      console.log("Payment before release:", payment);
      
      const currentAccount = await signer.getAddress();
      
      // Check if payment exists (has non-zero buyer)
      if (payment.buyer === "0x0000000000000000000000000000000000000000") {
        setCryptoMsg("Error: Payment not found. Make sure the payment was created and you're using the correct Order ID.");
        setResult({ ok: false, message: "Payment not found" });
        return;
      }
      
      // Check if we can release (is buyer or is platform treasury)
      if (payment.buyer.toLowerCase() !== currentAccount.toLowerCase()) {
        setCryptoMsg(`Error: You cannot release these funds. Buyer: ${payment.buyer}, Your address: ${currentAccount}`);
        setResult({ ok: false, message: "Not authorized to release funds" });
        return;
      }
      
      // Check payment status - ensure we convert BigInt/string to number
      const paymentStatus = Number(payment.status);
      console.log("Payment status raw:", payment.status, "converted:", paymentStatus);
      
      if (paymentStatus !== 1) { // 1 = Pending
        const statusMap = { 0: "None", 1: "Pending", 2: "Released", 3: "Refunded" };
        const currentStatusName = statusMap[paymentStatus] || "Unknown";
        setCryptoMsg(`Error: Invalid payment status. Current status: ${currentStatusName}. Required: Pending (status 1).`);
        setResult({ ok: false, message: `Payment not in Pending status. Current status: ${currentStatusName}` });
        return;
      }
      
      // Execute release with retry mechanism
      await executeWithRetry(async () => {
        await (await escrow.release(idBytes)).wait();
      }, 2, 1500);
      
      // Check payment status after release
      const paymentAfter = await escrow.getPayment(idBytes);
      console.log("Payment after release:", paymentAfter);
      
      setCryptoMsg(
        "Funds successfully distributed: 40% to partner, 40% to platform, 20% to city"
      );
      setResult({ ok: true, message: "Funds released and distributed!" });
    } catch (e) {
      console.error("Release error:", e);
      let errorMessage = "Error releasing funds";
      try {
        // Handle blockchain errors without triggering coalesce errors
        if (e.code === -32603 || e.payload?.method === "eth_sendTransaction") {
          errorMessage = "Network error: Transaction failed to submit. Try: 1) Wait and retry, 2) Switch network provider in MetaMask, 3) Check if you have enough MATIC for gas.";
        } else if (e.reason) {
          errorMessage = e.reason === "not authorized" ? 
            "Not authorized to release funds. Use the same wallet that created the payment." :
            e.reason === "not pending" ?
            "Payment not in pending status." :
            e.reason;
        } else if (e.message) {
          const cleanMessage = e.message.replace(/execution reverted:|coalesce:/gi, "").trim();
          if (e.message.includes("Internal JSON-RPC error")) {
            errorMessage = "Network error: Please try again or check your network connection.";
          } else if (cleanMessage.includes("not authorized")) {
            errorMessage = "Not authorized to release funds. Use the same wallet that created the payment.";
          } else if (cleanMessage.includes("not pending")) {
            errorMessage = "Payment not in pending status.";
          } else {
            errorMessage = cleanMessage;
          }
        } else if (e.error?.error?.message) {
          errorMessage = e.error.error.message;
        }
      } catch (parseError) {
        errorMessage = "Unknown error during funds release";
      }
      setCryptoMsg(errorMessage);
      setResult({ ok: false, message: errorMessage });
    } finally {
      setCryptoBusy(false);
    }
  };

  const callEscrow = async (method) => {
    const addr = NETWORKS.polygonAmoy.escrow.address;
    if (!addr || addr === "0x0000000000000000000000000000000000000000") {
      alert("Please set Escrow contract address in src/crypto.js first");
      return null;
    }
    const { signer } = await connectWallet();
    await ensurePreferredNetwork();
    return new Contract(addr, ESCROW_ABI, signer)[method];
  };


  const onRefund = async () => {
    if (!orderId) {
      alert("Enter Order ID");
      return;
    }
    try {
      setCryptoBusy(true);
      setCryptoMsg("Refunding payment to buyer...");
      // NOTE: Only platform treasury wallet can refund payments
      // This transfers all escrow funds back to the buyer
      const fn = await callEscrow("refund");
      const idBytes = encodeOrderId(orderId);
      
      // Use retry mechanism for better success rate
      await executeWithRetry(async () => {
        await (await fn(idBytes)).wait();
      }, 2, 1500);
      
      setCryptoMsg("Funds successfully refunded to buyer");
      setResult({ ok: true, message: "Refund completed successfully" });
    } catch (e) {
      console.error("Refund error:", e);
      let errorMessage = "Refund error";
      try {
        // Handle JSON-RPC network errors specifically
        if (e.code === -32603 || e.payload?.method === "eth_sendTransaction") {
          errorMessage = "Network error: Refund failed to submit. Try: 1) Wait and retry, 2) Switch network provider in MetaMask, 3) Check if you have enough MATIC for gas.";
        } else if (e.reason) {
          if (e.reason === "only platform") {
            errorMessage = "Authorization error: Only platform treasury can refund payments. Check that you are signed in with the platform account.";
          } else {
            errorMessage = e.reason;
          }
        } else if (e.message) {
          if (e.message.includes("Internal JSON-RPC error")) {
            errorMessage = "Network error: Please try again or check your network connection.";
          } else if (e.message.includes("only platform")) {
            errorMessage = "Authorization error: Only platform treasury can refund payments. Make sure you are using the platform wallet address: 0x5Fa6460D804d2833f302a58DEbef946C6B108Ba3";
          } else {
            errorMessage = e.message.replace(/execution reverted:|coalesce:/gi, "").trim();
          }
        } else if (e.error?.error?.message) {
          errorMessage = e.error.error.message;
        }
      } catch (parseError) {
        errorMessage = "Unknown error during refund";
      }
      setCryptoMsg(errorMessage);
      setResult({ ok: false, message: errorMessage });
    } finally {
      setCryptoBusy(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "expiry") {
      // Keep only digits, format as MM/YY, clamp month 01-12 on two digits
      const digitsOnly = value.replace(/[^0-9]/g, "").slice(0, 4);
      let month = digitsOnly.slice(0, 2);
      let year = digitsOnly.slice(2, 4);
      if (month.length === 1 && Number(month[0]) > 1) {
        month = `0${month[0]}`;
        year = digitsOnly.slice(1, 3);
      }
      if (month.length === 2) {
        const m = Math.min(Math.max(parseInt(month || "0", 10), 1), 12)
          .toString()
          .padStart(2, "0");
        month = m;
      }
      const formatted = year ? `${month}/${year}` : month;
      setForm((prev) => ({ ...prev, [name]: formatted }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    // Client-side validation
    const nextErrors = {};
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cardDigits = form.cardNumber.replace(/\s+/g, "");
    if (!expiryRegex.test(form.expiry)) {
      nextErrors.expiry = "Enter date in MM/YY (e.g., 12/29)";
    }
    if (!/^\d{3,4}$/.test(form.cvc)) {
      nextErrors.cvc = "CVC must be 3–4 digits";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email";
    }
    if (!/^\d{12,23}$/.test(cardDigits)) {
      nextErrors.cardNumber = "Card number must be 12–23 digits";
    }
    if (!form.fullName.trim()) {
      nextErrors.fullName = "Enter first and last name";
    }
    if (!form.amount.trim()) {
      nextErrors.amount = "Enter amount";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitting(false);
      return;
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResult({ ok: true, message: "Payment completed successfully" });
      setForm({
        fullName: "",
        email: "",
        cardNumber: "",
        expiry: "",
        cvc: "",
        amount: "",
      });
    } catch (err) {
      setResult({ ok: false, message: "Payment error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <div style={{ flex: 1, background: "#fff" }} />
      <div className="sidebar" style={{ width: "500px", maxWidth: "60%" }}>
        <h2 style={{ margin: 0 }}>Payment</h2>
        <p>Enter your details to pay for the booking.</p>

        <div
          style={{
            border: "1px solid var(--border-color)",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>Web3 Wallet</div>
              <div style={{ fontSize: 12, color: "#475569" }}>
                Network: {chainId ? chainId : "—"} | Account:{" "}
                {account
                  ? `${account.slice(0, 6)}...${account.slice(-4)}`
                  : "not connected"}
              </div>
            </div>
            <button
              type="button"
              onClick={onConnectWallet}
              disabled={cryptoBusy}
            >
              {account ? "Reconnect" : "Connect wallet"}
            </button>
          </div>
          {cryptoMsg && (
            <div style={{ marginTop: 8, fontSize: 12 }}>{cryptoMsg}</div>
          )}
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 12 }}
        >
          <div>
            <label
              style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
            >
              Full name
            </label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Ivan Petrov"
              className="address-input"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid var(--border-color)",
              }}
              required
            />
            {errors.fullName && (
              <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>
                {errors.fullName}
              </div>
            )}
          </div>
          <div>
            <label
              style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid var(--border-color)",
              }}
              required
            />
            {errors.email && (
              <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>
                {errors.email}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label
                style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
              >
                Card number
              </label>
              <input
                name="cardNumber"
                value={form.cardNumber}
                onChange={handleChange}
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid var(--border-color)",
                }}
                required
              />
              {errors.cardNumber && (
                <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>
                  {errors.cardNumber}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
                >
                  MM/YY
                </label>
                <input
                  name="expiry"
                  value={form.expiry}
                  onChange={handleChange}
                  placeholder="12/29"
                  title="Enter in MM/YY format (e.g., 12/29)"
                  inputMode="numeric"
                  maxLength={5}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 6,
                    border: "1px solid var(--border-color)",
                  }}
                  required
                />
                {errors.expiry && (
                  <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>
                    {errors.expiry}
                  </div>
                )}
              </div>
              <div style={{ width: 120 }}>
                <label
                  style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
                >
                  CVC
                </label>
                <input
                  name="cvc"
                  value={form.cvc}
                  onChange={handleChange}
                  placeholder="123"
                  inputMode="numeric"
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 6,
                    border: "1px solid var(--border-color)",
                  }}
                  required
                />
                {errors.cvc && (
                  <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>
                    {errors.cvc}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label
              style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
            >
              Amount
            </label>
            <input
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="1200 RSD"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid var(--border-color)",
              }}
              required
            />
            {errors.amount && (
              <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>
                {errors.amount}
              </div>
            )}
          </div>

          <div>
            <label
              style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
            >
              Order ID (optional)
            </label>
            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="auto-generated if empty"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid var(--border-color)",
              }}
            />
          </div>

          {result && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${result.ok ? "#16a34a" : "#ef4444"}`,
                background: result.ok ? "#dcfce7" : "#fee2e2",
                color: result.ok ? "#166534" : "#991b1b",
                fontSize: 13,
              }}
            >
              {result.message}
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" disabled={submitting} style={{ flex: 1 }}>
              {submitting ? "Processing..." : "Pay"}
            </button>
            <button
              type="button"
              onClick={onCryptoPay}
              disabled={cryptoBusy}
              style={{ flex: 1, background: "#0a0", color: "#fff" }}
            >
              {cryptoBusy ? "Sending..." : "Pay with USDC"}
            </button>
            <button
              type="button"
              onClick={onEscrowPay}
              disabled={
                cryptoBusy ||
                !NETWORKS.polygonAmoy.escrow.address ||
                NETWORKS.polygonAmoy.escrow.address ===
                  "0x0000000000000000000000000000000000000000"
              }
              style={{ flex: 1, background: "#2563eb", color: "#fff" }}
            >
              {cryptoBusy ? "Creating..." : "Pay to ESCROW"}
            </button>
            <button
              type="button"
              onClick={checkPaymentStatus}
              disabled={cryptoBusy || !orderId}
              style={{ flex: 1, background: "#059669", color: "#fff" }}
            >
              Check Status
            </button>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={onReleaseFunds}
              disabled={cryptoBusy || !orderId}
              style={{ flex: 1, background: "#dc2626", color: "#fff" }}
            >
              Release Funds
            </button>
            <button
              type="button"
              onClick={onRefund}
              disabled={cryptoBusy}
              style={{ flex: 1, background: "#b91c1c", color: "#fff" }}
            >
              Refund
            </button>
            <a href="/" style={{ flex: 1 }}>
              <button
                type="button"
                style={{
                  width: "100%",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                }}
              >
                Back
              </button>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
