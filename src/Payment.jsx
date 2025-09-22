import React, { useState } from "react";

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
      nextErrors.expiry = "Введите дату в формате MM/YY (например, 12/29)";
    }
    if (!/^\d{3,4}$/.test(form.cvc)) {
      nextErrors.cvc = "CVC должен быть из 3–4 цифр";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Введите корректный email";
    }
    if (!/^\d{12,23}$/.test(cardDigits)) {
      nextErrors.cardNumber = "Номер карты должен содержать 12–23 цифры";
    }
    if (!form.fullName.trim()) {
      nextErrors.fullName = "Укажите имя и фамилию";
    }
    if (!form.amount.trim()) {
      nextErrors.amount = "Укажите сумму";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitting(false);
      return;
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResult({ ok: true, message: "Оплата прошла успешно" });
      setForm({ fullName: "", email: "", cardNumber: "", expiry: "", cvc: "", amount: "" });
    } catch (err) {
      setResult({ ok: false, message: "Ошибка оплаты. Попробуйте снова." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <div style={{ flex: 1, background: "#fff" }} />
      <div className="sidebar" style={{ width: "var(--sidebar-width)", maxWidth: "40%" }}>
        <h2 style={{ margin: 0 }}>Оплата</h2>
        <p>Введите данные для оплаты бронирования.</p>

        <form noValidate onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Имя и фамилия</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Ivan Petrov"
              className="address-input"
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid var(--border-color)" }}
              required
            />
            {errors.fullName && (
              <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>{errors.fullName}</div>
            )}
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid var(--border-color)" }}
              required
            />
            {errors.email && (
              <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>{errors.email}</div>
            )}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Номер карты</label>
              <input
                name="cardNumber"
                value={form.cardNumber}
                onChange={handleChange}
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
                style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid var(--border-color)" }}
                required
              />
              {errors.cardNumber && (
                <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>{errors.cardNumber}</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>MM/YY</label>
                <input
                  name="expiry"
                  value={form.expiry}
                  onChange={handleChange}
                  placeholder="12/29"
                  title="Введите в формате MM/YY (например, 12/29)"
                  inputMode="numeric"
                  maxLength={5}
                  style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid var(--border-color)" }}
                  required
                />
                {errors.expiry && (
                  <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>{errors.expiry}</div>
                )}
              </div>
              <div style={{ width: 120 }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>CVC</label>
                <input
                  name="cvc"
                  value={form.cvc}
                  onChange={handleChange}
                  placeholder="123"
                  inputMode="numeric"
                  style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid var(--border-color)" }}
                  required
                />
                {errors.cvc && (
                  <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>{errors.cvc}</div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Сумма</label>
            <input
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="1200 RSD"
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid var(--border-color)" }}
              required
            />
            {errors.amount && (
              <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>{errors.amount}</div>
            )}
          </div>

          {result && (
            <div style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${result.ok ? "#16a34a" : "#ef4444"}`,
              background: result.ok ? "#dcfce7" : "#fee2e2",
              color: result.ok ? "#166534" : "#991b1b",
              fontSize: 13,
            }}>
              {result.message}
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" disabled={submitting} style={{ flex: 1 }}>
              {submitting ? "Обработка..." : "Оплатить"}
            </button>
            <a href="/" style={{ flex: 1 }}>
              <button type="button" style={{ width: "100%", background: "var(--bg-tertiary)", color: "var(--text-primary)" }}>Назад</button>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}


