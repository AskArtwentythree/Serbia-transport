import React, { useState } from "react";

function Profile({ isOpen, onClose, user, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  const handleSave = () => {
    onUpdateUser(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="profile-modal"
        style={{
          background: "var(--bg-secondary)",
          borderRadius: "12px",
          padding: "24px",
          width: "100%",
          maxWidth: "400px",
          maxHeight: "90vh",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-xl)",
          overflowY: "auto",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, color: "var(--text-primary)" }}>
            My Profile
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            ×
          </button>
        </div>

        {!isEditing ? (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "var(--primary-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  color: "white",
                  margin: "0 auto 16px",
                }}
              >
                {(user.fullName || user.name || "U").charAt(0).toUpperCase()}
              </div>
              <h3 style={{ textAlign: "center", margin: "0 0 8px 0" }}>
                {user.fullName || user.name || "User"}
              </h3>
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  margin: 0,
                }}
              >
                {user.email}
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>Phone:</span>
                <span style={{ color: "var(--text-primary)" }}>
                  {user.phone}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>City:</span>
                <span style={{ color: "var(--text-primary)" }}>
                  {user.city}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  Preferences:
                </span>
                <span style={{ color: "var(--text-primary)" }}>
                  {user.preferences.join(", ")}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              style={{
                width: "100%",
                background: "var(--primary-color)",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                }}
              >
                Name:
              </label>
              <input
                type="text"
                value={editedUser.fullName || editedUser.name || ""}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, fullName: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                }}
              >
                Email:
              </label>
              <input
                type="email"
                value={editedUser.email}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, email: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                }}
              >
                Phone:
              </label>
              <input
                type="tel"
                value={editedUser.phone}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, phone: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                }}
              >
                City:
              </label>
              <select
                value={editedUser.city}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, city: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              >
                <option value="Belgrade">Belgrade</option>
                <option value="Novi Sad">Novi Sad</option>
                <option value="Niš">Niš</option>
                <option value="Kragujevac">Kragujevac</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                }}
              >
                Transport Preferences:
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {[
                  "Scooters",
                  "Bicycles",
                  "Car Sharing",
                  "Public Transport",
                ].map((pref) => (
                  <label
                    key={pref}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={editedUser.preferences.includes(pref)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditedUser({
                            ...editedUser,
                            preferences: [...editedUser.preferences, pref],
                          });
                        } else {
                          setEditedUser({
                            ...editedUser,
                            preferences: editedUser.preferences.filter(
                              (p) => p !== pref
                            ),
                          });
                        }
                      }}
                      style={{ margin: 0 }}
                    />
                    {pref}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleSave}
                style={{
                  flex: 1,
                  background: "var(--success-color)",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                style={{
                  flex: 1,
                  background: "var(--text-muted)",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
