import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function DIDGenerate() {
  const [generatedDID, setGeneratedDID] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate a mock DID
  const generateDID = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let did = "did:web:";

    // Add random string
    for (let i = 0; i < 16; i++) {
      did += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setGeneratedDID(did);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedDID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = generatedDID;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const loginWithDID = () => {
    if (generatedDID) {
      localStorage.setItem("userDID", generatedDID);
      window.location.href = "/";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
          linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.02) 50%, transparent 60%)
        `,
          backgroundSize: "100px 100px, 150px 150px, 50px 50px",
        }}
      />

      {/* Stars */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
          radial-gradient(2px 2px at 20px 30px, #fff, transparent),
          radial-gradient(2px 2px at 40px 70px, #fff, transparent),
          radial-gradient(1px 1px at 90px 40px, #fff, transparent),
          radial-gradient(1px 1px at 130px 80px, #fff, transparent),
          radial-gradient(2px 2px at 160px 30px, #fff, transparent)
        `,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 100px",
          opacity: 0.3,
        }}
      />

      {/* Back button */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 2,
        }}
      >
        <Link
          to="/did/login"
          style={{
            color: "white",
            fontSize: "24px",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          ← Back
        </Link>
      </div>

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 32px",
            boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "white",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#3b82f6",
            }}
          >
            ⭐
          </div>
        </div>

        {/* Title */}
        <h1
          style={{
            color: "white",
            fontSize: "28px",
            fontWeight: "700",
            margin: "0 0 16px 0",
            letterSpacing: "-0.02em",
          }}
        >
          Create your Decentralized Identity
        </h1>

        {/* Login prompt */}
        <p
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "16px",
            margin: "0 0 32px 0",
            lineHeight: "1.5",
          }}
        >
          Already have an DID?{" "}
          <Link
            to="/did/login"
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Log in
          </Link>
        </p>

        {/* Generate button */}
        <button
          onClick={generateDID}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "18px",
            fontWeight: "600",
            color: "white",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
            transition: "all 0.3s ease",
            marginBottom: "24px",
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 12px 40px rgba(59, 130, 246, 0.4)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 8px 32px rgba(59, 130, 246, 0.3)";
          }}
        >
          Generate
        </button>

        {/* Info text */}
        <div
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "14px",
            margin: "0 0 24px 0",
            lineHeight: "1.5",
          }}
        >
          <p style={{ margin: "0 0 8px 0" }}>
            your DID will be generated automatically
          </p>
          <p style={{ margin: "0" }}>
            Save your DID. You will need it to log in
          </p>
        </div>

        {/* DID display */}
        {generatedDID && (
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "16px",
              margin: "0 0 24px 0",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                flex: 1,
                fontSize: "14px",
                color: "#1f2937",
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              {generatedDID}
            </div>
            <button
              onClick={copyToClipboard}
              style={{
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: "600",
                color: "white",
                background: copied ? "#10b981" : "#3b82f6",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        )}

        {/* Warning */}
        {generatedDID && (
          <div
            style={{
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "8px",
              padding: "12px",
              margin: "0 0 24px 0",
            }}
          >
            <p
              style={{
                color: "#f59e0b",
                fontSize: "14px",
                margin: "0",
                fontWeight: "500",
              }}
            >
              ⚠️ Important: Save this DID securely. You'll need it to access
              your account.
            </p>
          </div>
        )}

        {/* Login with DID button */}
        {generatedDID && (
          <button
            onClick={loginWithDID}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "18px",
              fontWeight: "600",
              color: "white",
              background: "linear-gradient(135deg, #10b981, #059669)",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 12px 40px rgba(16, 185, 129, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 32px rgba(16, 185, 129, 0.3)";
            }}
          >
            Log in with this DID
          </button>
        )}
      </div>
    </div>
  );
}
