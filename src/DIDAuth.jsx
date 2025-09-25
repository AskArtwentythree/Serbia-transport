import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import DIDProfileSetup from "./DIDProfileSetup";

export default function DIDAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    // Check if user has a DID stored
    const userDID = localStorage.getItem("userDID");
    const userProfile = localStorage.getItem("userProfile");

    setIsAuthenticated(!!userDID);
    setNeedsProfile(!!userDID && !userProfile);
    setIsLoading(false);
  }, []);

  const handleProfileComplete = (profile) => {
    setNeedsProfile(false);
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: "18px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(255, 255, 255, 0.3)",
              borderTop: "3px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/did/login" replace />;
  }

  if (needsProfile) {
    return <DIDProfileSetup onComplete={handleProfileComplete} />;
  }

  return <Outlet />;
}

// Hook to get current user DID
export const useDID = () => {
  const [userDID, setUserDID] = useState(null);

  useEffect(() => {
    const did = localStorage.getItem("userDID");
    setUserDID(did);
  }, []);

  const logout = () => {
    localStorage.removeItem("userDID");
    setUserDID(null);
    window.location.href = "/did/login";
  };

  return { userDID, logout };
};
