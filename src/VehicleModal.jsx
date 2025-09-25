import React from "react";

function VehicleModal({ isOpen, onClose, vehicle, onNavigate }) {
  if (!isOpen || !vehicle) return null;

  const getVehicleIcon = (type) => {
    switch (type) {
      case "scooter":
        return "🛴";
      case "bike":
        return "🚲";
      case "car":
        return "🚗";
      case "bus":
        return "🚌";
      case "tram":
        return "🚋";
      default:
        return "🚗";
    }
  };

  const getStatusColor = (battery) => {
    if (!battery) return "#10b981"; // Green for no battery (cars, bikes)
    if (battery >= 80) return "#10b981"; // Green
    if (battery >= 50) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  };

  const getStatusText = (battery) => {
    if (!battery) return "Available";
    if (battery >= 80) return "Excellent condition";
    if (battery >= 50) return "Good condition";
    return "Low battery";
  };

  return (
    <div
      className="vehicle-modal"
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
        className="modal-content"
        style={{
          background: "var(--bg-secondary)",
          borderRadius: "16px",
          padding: "24px",
          width: "100%",
          maxWidth: "400px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-xl)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                // background: "var(--primary-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              {getVehicleIcon(vehicle.type)}
            </div>
            <div>
              <h2 style={{ margin: 0, color: "var(--text-primary)" }}>
                {vehicle.title}
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                }}
              >
                {vehicle.operator}
              </p>
            </div>
          </div>
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

        {/* Vehicle Image */}
        <div
          style={{
            width: "100%",
            height: "200px",
            background: "var(--bg-tertiary)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
            overflow: "hidden",
          }}
        >
          <img
            src={vehicle.image}
            alt={vehicle.type}
            style={{
              objectFit: "contain",
              width: vehicle.type === "scooter" ? 200 : "inherent",
              height: vehicle.type === "scooter" ? "auto" : "auto",
            }}
          />
        </div>

        {/* Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
            padding: "12px",
            background: "var(--bg-tertiary)",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: getStatusColor(vehicle.battery),
            }}
          ></div>
          <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>
            {getStatusText(vehicle.battery)}
          </span>
          {vehicle.battery && (
            <span
              style={{ color: "var(--text-secondary)", marginLeft: "auto" }}
            >
              🔋 {vehicle.battery}%
            </span>
          )}
        </div>

        {/* Details */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 12px 0", color: "var(--text-primary)" }}>
            Details
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div
              style={{
                padding: "12px",
                background: "var(--bg-tertiary)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Price
              </div>
              <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                {vehicle.price}
              </div>
            </div>
            <div
              style={{
                padding: "12px",
                background: "var(--bg-tertiary)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Distance
              </div>
              <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                {vehicle.distance.toFixed(1)} km
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 12px 0", color: "var(--text-primary)" }}>
            Location
          </h3>
          <div
            style={{
              padding: "12px",
              background: "var(--bg-tertiary)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}
          >
            <div>Latitude: {vehicle.lat.toFixed(6)}</div>
            <div>Longitude: {vehicle.lon.toFixed(6)}</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate(vehicle);
                onClose(); // Close modal after starting navigation
              } else {
                alert("Navigation function not available");
              }
            }}
            style={{
              flex: 1,
              background: "var(--primary-color)",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Navigate
          </button>
          <button
            onClick={() => {
              alert(
                `🚀 Booking: ${vehicle.title}\n\nOperator: ${vehicle.operator}\nPrice: ${vehicle.price}\n\n ${vehicle.operator}`
              );
            }}
            style={{
              flex: 1,
              background: "var(--success-color)",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🚀 Book
          </button>
        </div>
      </div>
    </div>
  );
}

export default VehicleModal;
