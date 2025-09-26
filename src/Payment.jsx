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
      setCryptoMsg("Preparing transaction...");
      const decimals = preferred.usdc.decimals;
      const amount = formatAmountToUnits(amountStr, decimals);
      const merchant = "0x000000000000000000000000000000000000dEaD"; // demo merchant address
      const { signer } = await connectWallet();
      await ensurePreferredNetwork();
      const receipt = await erc20Transfer({ signer, token: preferred.usdc.address, to: merchant, amount, decimals });
      setCryptoMsg(`Paid in blockchain. Hash: ${receipt.hash.slice(0, 10)}...`);
      setResult({ ok: true, message: "Crypto payment successful" });
    } catch (e) {
      setCryptoMsg(e.shortMessage || e.message || "Crypto payment error");
      setResult({ ok: false, message: "Crypto payment error" });
    } finally {
      setCryptoBusy(false);
    }
  };

  // ===== Escrow (approve + createPayment) =====
  const ESCROW_ABI = [
    "function createPayment(bytes32 orderId, address partner, uint256 amount)",
    "function release(bytes32 orderId)",
    "function refund(bytes32 orderId)",
  ];

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
      // 1) Approve escrow to spend USDC
      const erc20 = new Contract(
        preferred.usdc.address,
        ["function approve(address,uint256) returns (bool)"],
        signer
      );
      setCryptoMsg("Approve USDC spending...");
      await (
        await erc20.approve(NETWORKS.polygonAmoy.escrow.address, amount)
      ).wait();
      // 2) Create escrow payment
      const escrow = new Contract(
        NETWORKS.polygonAmoy.escrow.address,
        ESCROW_ABI,
        signer
      );
      const id = orderId || crypto.randomUUID();
      const idBytes = `0x${Buffer.from(id)
        .toString("hex")
        .slice(0, 64)
        .padEnd(64, "0")}`;
      setOrderId(id);
      setCryptoMsg("Creating escrow payment...");
      await (await escrow.createPayment(idBytes, partner, amount)).wait();
      setCryptoMsg("Эскроу создан. Ожидает выпуска средств.");
      setResult({ ok: true, message: "Эскроу-платёж создан" });
    } catch (e) {
      setCryptoMsg(e.shortMessage || e.message || "Escrow creation error");
      setResult({ ok: false, message: "Escrow creation error" });
    } finally {
      setCryptoBusy(false);
    }
  };

  const onReleaseFunds = async () => {
    if (!orderId) {
      setCryptoMsg("Сначала создайте эскроу-платёж");
      return;
    }
    try {
      setCryptoBusy(true);
      setCryptoMsg("Выпуск средств из эскроу...");
      const { signer } = await connectWallet();
      const escrow = new Contract(
        NETWORKS.polygonAmoy.escrow.address,
        ESCROW_ABI,
        signer
      );
      const idBytes = `0x${Buffer.from(orderId)
        .toString("hex")
        .slice(0, 64)
        .padEnd(64, "0")}`;
      await (await escrow.release(idBytes)).wait();
      setCryptoMsg(
        "Средства успешно распределены: 40% партнёру, 40% платформе, 20% городу"
      );
      setResult({ ok: true, message: "Средства выпущены и распределены!" });
    } catch (e) {
      setCryptoMsg(e.shortMessage || e.message || "Ошибка выпуска средств");
      setResult({ ok: false, message: "Ошибка выпуска средств" });
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

  const onRelease = async () => {
    if (!orderId) {
      alert("Enter Order ID");
      return;
    }
    try {
      setCryptoBusy(true);
      setCryptoMsg("Releasing funds...");
      const fn = await callEscrow("release");
      const idBytes = `0x${Buffer.from(orderId)
        .toString("hex")
        .slice(0, 64)
        .padEnd(64, "0")}`;
      await (await fn(idBytes)).wait();
      setCryptoMsg("Funds released from escrow");
    } catch (e) {
      setCryptoMsg(e.shortMessage || e.message || "Release error");
    } finally {
      setCryptoBusy(false);
    }
  };

  const onRefund = async () => {
    if (!orderId) {
      alert("Enter Order ID");
      return;
    }
    try {
      setCryptoBusy(true);
      setCryptoMsg("Refunding...");
      const fn = await callEscrow("refund");
      const idBytes = `0x${Buffer.from(orderId)
        .toString("hex")
        .slice(0, 64)
        .padEnd(64, "0")}`;
      await (await fn(idBytes)).wait();
      setCryptoMsg("Funds refunded to buyer");
    } catch (e) {
      setCryptoMsg(e.shortMessage || e.message || "Refund error");
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
      setResult({ ok: true, message: "Оплата прошла успешно" });
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
              onClick={onReleaseFunds}
              disabled={cryptoBusy || !orderId}
              style={{ flex: 1, background: "#dc2626", color: "#fff" }}
            >
              {cryptoBusy ? "Releasing..." : "Release Funds"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={onRelease}
              disabled={cryptoBusy}
              style={{ flex: 1, background: "#6b21a8", color: "#fff" }}
            >
              Release funds
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
