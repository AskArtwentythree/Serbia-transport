import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function DIDLogin() {
  const [did, setDid] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!did.trim()) {
      setError("Please enter your DID");
      return;
    }

    // Mock validation - any non-empty DID is valid
    if (did.length < 10) {
      setError("DID appears to be too short");
      return;
    }

    // Store DID in localStorage
    localStorage.setItem("userDID", did.trim());

    // Redirect to main app
    window.location.href = "/";
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
            fontSize: "32px",
            fontWeight: "700",
            margin: "0 0 16px 0",
            letterSpacing: "-0.02em",
          }}
        >
          Sign in to your Account
        </h1>

        {/* DID prompt */}
        <p
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "16px",
            margin: "0 0 32px 0",
            lineHeight: "1.5",
          }}
        >
          Don't have a decentralized identity?{" "}
          <Link
            to="/did/generate"
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Create
          </Link>
        </p>

        {/* DID input */}
        <div style={{ marginBottom: "24px" }}>
          <input
            type="text"
            value={did}
            onChange={(e) => {
              setDid(e.target.value);
              setError("");
            }}
            placeholder="enter your DID"
            style={{
              width: "100%",
              padding: "16px 20px",
              fontSize: "16px",
              borderRadius: "12px",
              border: "none",
              background: "white",
              color: "#1f2937",
              outline: "none",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          />
          {error && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "14px",
                margin: "8px 0 0 0",
                textAlign: "left",
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* Slogan */}
        <p
          style={{
            color: "white",
            fontSize: "18px",
            fontWeight: "600",
            margin: "0 0 32px 0",
          }}
        >
          No Passwords. Fast. Secure.
        </p>

        {/* Login button */}
        <button
          onClick={handleLogin}
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
          Log In
        </button>
      </div>
    </div>
  );
}
