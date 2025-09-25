import React, { useState } from "react";

export default function DIDProfileSetup({ onComplete }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "Belgrade",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[0-9\s\-()]{10,}$/.test(form.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Save profile to localStorage
    const userProfile = {
      ...form,
      preferences: ["Scooters", "Bicycles", "Car Sharing"],
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("userProfile", JSON.stringify(userProfile));

    setIsSubmitting(false);
    onComplete(userProfile);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
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
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          padding: "40px",
          maxWidth: "500px",
          width: "100%",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              borderRadius: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                background: "white",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#3b82f6",
              }}
            >
              👤
            </div>
          </div>

          <h1
            style={{
              color: "white",
              fontSize: "28px",
              fontWeight: "700",
              margin: "0 0 8px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Complete Your Profile
          </h1>

          <p
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "16px",
              margin: "0",
              lineHeight: "1.5",
            }}
          >
            Set up your account to get personalized recommendations
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* Full Name */}
          <div>
            <label
              style={{
                display: "block",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              style={{
                width: "100%",
                padding: "14px 16px",
                fontSize: "16px",
                borderRadius: "10px",
                border: errors.fullName
                  ? "2px solid #ef4444"
                  : "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "white",
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.background = "rgba(255, 255, 255, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.fullName
                  ? "#ef4444"
                  : "rgba(255, 255, 255, 0.2)";
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
              }}
            />
            {errors.fullName && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  margin: "6px 0 0 0",
                }}
              >
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              style={{
                display: "block",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              style={{
                width: "100%",
                padding: "14px 16px",
                fontSize: "16px",
                borderRadius: "10px",
                border: errors.email
                  ? "2px solid #ef4444"
                  : "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "white",
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.background = "rgba(255, 255, 255, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.email
                  ? "#ef4444"
                  : "rgba(255, 255, 255, 0.2)";
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
              }}
            />
            {errors.email && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  margin: "6px 0 0 0",
                }}
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              style={{
                display: "block",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+381 60 123 4567"
              style={{
                width: "100%",
                padding: "14px 16px",
                fontSize: "16px",
                borderRadius: "10px",
                border: errors.phone
                  ? "2px solid #ef4444"
                  : "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "white",
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.background = "rgba(255, 255, 255, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.phone
                  ? "#ef4444"
                  : "rgba(255, 255, 255, 0.2)";
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
              }}
            />
            {errors.phone && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  margin: "6px 0 0 0",
                }}
              >
                {errors.phone}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <label
              style={{
                display: "block",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              City
            </label>
            <select
              name="city"
              value={form.city}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "14px 16px",
                fontSize: "16px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "white",
                outline: "none",
                transition: "all 0.3s ease",
              }}
            >
              <option
                value="Belgrade"
                style={{ background: "#1e293b", color: "white" }}
              >
                Belgrade
              </option>
              <option
                value="Novi Sad"
                style={{ background: "#1e293b", color: "white" }}
              >
                Novi Sad
              </option>
              <option
                value="Niš"
                style={{ background: "#1e293b", color: "white" }}
              >
                Niš
              </option>
              <option
                value="Kragujevac"
                style={{ background: "#1e293b", color: "white" }}
              >
                Kragujevac
              </option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "18px",
              fontWeight: "600",
              color: "white",
              background: isSubmitting
                ? "rgba(59, 130, 246, 0.5)"
                : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              border: "none",
              borderRadius: "12px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
              transition: "all 0.3s ease",
              marginTop: "8px",
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow =
                  "0 12px 40px rgba(59, 130, 246, 0.4)";
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 8px 32px rgba(59, 130, 246, 0.3)";
              }
            }}
          >
            {isSubmitting ? "Creating Profile..." : "Complete Setup"}
          </button>
        </form>

        {/* Footer */}
        <p
          style={{
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "12px",
            textAlign: "center",
            margin: "24px 0 0 0",
            lineHeight: "1.4",
          }}
        >
          Your profile information is stored securely and will be used to
          personalize your mobility experience.
        </p>
      </div>
    </div>
  );
}
