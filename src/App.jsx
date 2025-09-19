import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./styles.css";
import { MOCK_VEHICLES, generateVehiclesNearRoute } from "./mockData";
import Profile from "./Profile";
import VehicleModal from "./VehicleModal";
import AddressSearch from "./AddressSearch";

// Fix default icon paths (Leaflet + Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Import local icons
import carIcon from "./assets/car.png";
import scooterIcon from "./assets/scooter.png";

// small icons by type - using local assets with beautiful styling
const iconFor = (type) => {
  const iconColor =
    type === "scooter"
      ? "#06b6d4"
      : type === "bike"
      ? "#10b981"
      : type === "car"
      ? "#f59e0b"
      : "#6366f1"; // Default color

  return L.divIcon({
    html: `
      <div style="
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, ${iconColor}, ${iconColor}dd);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 2px ${iconColor}40;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        animation: pulse 2s infinite;
      ">
        <img src="${
          type === "scooter"
            ? scooterIcon
            : type === "bike"
            ? scooterIcon
            : type === "car"
            ? carIcon
            : scooterIcon
        }" 
        style="
          width: 28px;
          height: 28px;
          filter: brightness(0) invert(1);
          object-fit: contain;
        " />
        <div style="
          position: absolute;
          top: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #22c55e;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        "></div>
      </div>
    `,
    className: "vehicle-icon",
    iconSize: [50, 50],
    iconAnchor: [25, 25],
  });
};

function MapClickHandler({ setStart, setEnd, start, end, clearRoute }) {
  useMapEvents({
    click(e) {
      const latlng = e.latlng;
      if (!start) {
        setStart(latlng);
      } else if (!end) {
        setEnd(latlng);
      } else {
        // если уже есть обе точки — сбросим и поставим новую start
        setStart(latlng);
        setEnd(null);
        clearRoute();
      }
    },
  });
  return null;
}

// Separate Map component to avoid re-initialization issues
function MapComponent({
  start,
  end,
  route,
  nearbyVehicles,
  setStart,
  setEnd,
  clearRoute,
  mapRef,
  onVehicleClick,
}) {
  const mapKey = useMemo(() => `map-${Date.now()}`, []);

  return (
    <MapContainer
      key={mapKey}
      center={[44.816, 20.456]} // Belgrade center
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler
        setStart={setStart}
        setEnd={setEnd}
        start={start}
        end={end}
        clearRoute={() => clearRoute()}
      />

      {start && (
        <Marker position={[start.lat, start.lng]}>
          <Popup>
            <div>
              <strong>Точка A</strong>
              <div>
                {start.lat.toFixed(6)}, {start.lng.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      )}
      {end && (
        <Marker position={[end.lat, end.lng]}>
          <Popup>
            <div>
              <strong>Точка B</strong>
              <div>
                {end.lat.toFixed(6)}, {end.lng.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      )}

      {route && route.length > 0 && (
        <Polyline
          positions={route}
          color="#000000"
          weight={4}
          opacity={0.8}
          className="route-line"
        />
      )}

      {nearbyVehicles.map((v) => (
        <Marker
          key={v.id}
          position={[v.lat, v.lon]}
          icon={iconFor(v.type)}
          eventHandlers={{
            click: () => onVehicleClick(v),
          }}
        >
          <Popup>
            <div style={{ width: 200, color: "var(--text-primary)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <strong style={{ fontSize: "14px" }}>{v.title}</strong>
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: "8px",
                    fontSize: "10px",
                    background:
                      v.type === "scooter"
                        ? "rgba(6, 182, 212, 0.2)"
                        : v.type === "bike"
                        ? "rgba(16, 185, 129, 0.2)"
                        : v.type === "car"
                        ? "rgba(245, 158, 11, 0.2)"
                        : "rgba(99, 102, 241, 0.2)",
                    color:
                      v.type === "scooter"
                        ? "var(--accent-color)"
                        : v.type === "bike"
                        ? "var(--success-color)"
                        : v.type === "car"
                        ? "var(--warning-color)"
                        : "var(--primary-color)",
                  }}
                >
                  {v.type}
                </span>
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  marginBottom: "8px",
                }}
              >
                <div>🚗 {v.operator}</div>
                <div>💰 {v.price}</div>
                {v.battery && <div>🔋 {v.battery}%</div>}
                <div>📍 {v.distance.toFixed(1)}km away</div>
              </div>

              <button
                onClick={() =>
                  alert(
                    `🚀 Бронирование: ${v.title}\n\nОператор: ${v.operator}\nЦена: ${v.price}\n\n(В реальном приложении тут будет deep link к приложению ${v.operator})`
                  )
                }
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-color), var(--primary-dark))",
                  border: "none",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                  width: "100%",
                  transition: "all 0.3s ease",
                }}
              >
                🚀 Забронировать
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default function App() {
  // Start/End are Leaflet LatLng-like objects
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [route, setRoute] = useState([]); // array of [lat, lon]
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedVehicle, _setSelectedVehicle] = useState(null);
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [user, setUser] = useState({
    name: "Alexander Petrov",
    email: "alex.petrov@email.com",
    phone: "+381 60 123 4567",
    city: "Belgrade",
    preferences: ["Scooters", "Bicycles", "Car Sharing"],
  });
  const mapRef = useRef();

  // Mock vehicles are loaded directly from MOCK_VEHICLES

  // Generate vehicles near route when start/end points are selected and scanning is complete
  const nearbyVehicles = React.useMemo(() => {
    if (start && end && !isScanning) {
      return generateVehiclesNearRoute(start, end);
    }
    return []; // Show no vehicles until route is built and scanning is complete
  }, [start, end, isScanning]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    async function fetchOSRMRoute() {
      if (!start || !end) return;
      setLoadingRoute(true);
      setIsScanning(true);

      try {
        // OSRM public demo server — lon,lat;lon,lat
        const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
        const resp = await axios.get(url);
        if (resp.data && resp.data.routes && resp.data.routes.length > 0) {
          const coords = resp.data.routes[0].geometry.coordinates; // [lon,lat] pairs
          // convert to [lat, lon] for Leaflet Polyline
          const latlngs = coords.map(([lon, lat]) => [lat, lon]);
          setRoute(latlngs);

          // fit bounds
          if (mapRef.current) {
            const map = mapRef.current;
            const bounds = latlngs.reduce(
              (b, c) => (b ? b.extend(c) : L.latLngBounds(c, c)),
              null
            );
            if (bounds) map.fitBounds(bounds, { padding: [50, 50] });
          }

          // Simulate scanning delay for mobile UX
          setTimeout(() => {
            setIsScanning(false);
          }, 2000);
        } else {
          alert("Route not found.");
          setRoute([]);
          setIsScanning(false);
        }
      } catch (err) {
        console.error("OSRM error:", err);
        alert("Route building error (OSRM). Please try again.");
        setRoute([]);
        setIsScanning(false);
      } finally {
        setLoadingRoute(false);
      }
    }
    fetchOSRMRoute();
  }, [start, end]);

  const clearAll = () => {
    setStart(null);
    setEnd(null);
    setRoute([]);
    setStartAddress("");
    setEndAddress("");
  };

  const handleStartAddressSelect = (address) => {
    setStart({ lat: address.lat, lng: address.lng });
    setStartAddress(address.name);
  };

  const handleEndAddressSelect = (address) => {
    setEnd({ lat: address.lat, lng: address.lng });
    setEndAddress(address.name);
  };

  const clearStartAddress = () => {
    setStart(null);
    setStartAddress("");
  };

  const clearEndAddress = () => {
    setEnd(null);
    setEndAddress("");
  };

  return (
    <div className="app-root">
      <div className="map-pane">
        <MapComponent
          start={start}
          end={end}
          route={route}
          nearbyVehicles={nearbyVehicles}
          setStart={setStart}
          setEnd={setEnd}
          clearRoute={() => setRoute([])}
          mapRef={mapRef}
          onVehicleClick={(vehicle) => {
            _setSelectedVehicle(vehicle);
            setIsVehicleModalOpen(true);
          }}
        />
      </div>

      <div className="sidebar">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ margin: 0 }}>Mobility MVP — Serbia</h2>
          <button
            onClick={() => setIsProfileOpen(true)}
            className="profile-button"
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              padding: "8px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "var(--text-primary)",
            }}
          >
            👤 {user.name.split(" ")[0]}
          </button>
        </div>
        <p>
          {!start && !end && "📱 Select point A on the map or enter an address"}
          {start &&
            !end &&
            "📱 Now select point B on the map or enter an address"}
          {start && end && isScanning && "🔍 Scanning area near the route..."}
          {start && end && !isScanning && "✅ Route built! Transport found!"}
        </p>

        {/* Address Search */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                color: "var(--text-primary)",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              📍 Point A (Start)
            </label>
            <AddressSearch
              onAddressSelect={handleStartAddressSelect}
              placeholder="Enter starting address..."
              value={startAddress}
              onClear={clearStartAddress}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                color: "var(--text-primary)",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              🎯 Point B (End)
            </label>
            <AddressSearch
              onAddressSelect={handleEndAddressSelect}
              placeholder="Enter destination address..."
              value={endAddress}
              onClear={clearEndAddress}
            />
          </div>
        </div>

        <div className="coords-block">
          <div>
            <b>Start (A):</b>{" "}
            {start ? `${start.lat.toFixed(6)}, ${start.lng.toFixed(6)}` : "—"}
          </div>
          <div>
            <b>End (B):</b>{" "}
            {end ? `${end.lat.toFixed(6)}, ${end.lng.toFixed(6)}` : "—"}
          </div>
          {loadingRoute && (
            <div
              style={{
                marginTop: "8px",
                color: "var(--accent-color)",
                fontSize: "12px",
              }}
            >
              🔄 Building route...
            </div>
          )}
          {isScanning && (
            <div
              style={{
                marginTop: "8px",
                color: "var(--primary-color)",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  border: "2px solid var(--primary-color)",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              Scanning transport near the route...
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 20,
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setRoute([])}
            disabled={!route.length}
            style={{
              background: route.length
                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                : "var(--bg-tertiary)",
              border: route.length
                ? "1px solid #ef4444"
                : "1px solid var(--border-color)",
              color: route.length ? "white" : "var(--text-muted)",
            }}
          >
            🗑️ Remove Route
          </button>
          <button
            onClick={clearAll}
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              border: "1px solid #8b5cf6",
            }}
          >
            🔄 Reset Points
          </button>
        </div>

        <hr />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ margin: 0 }}>
            {!start || !end
              ? "🚗 Select Route"
              : isScanning
              ? "🔍 Scanning..."
              : "🚗 Near Route"}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}
          >
            {!isScanning && (
              <>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--success-color)",
                    animation: "pulse 2s infinite",
                  }}
                ></div>
                {nearbyVehicles.length} available
              </>
            )}
          </div>
        </div>

        {/* Статистика по типам транспорта */}
        {start && end && !isScanning && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
              gap: "8px",
              marginBottom: "16px",
              padding: "12px",
              background:
                "linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(99, 102, 241, 0.05) 100%)",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
            }}
          >
            {["scooter", "bike", "car", "bus", "tram"].map((type) => {
              const count = nearbyVehicles.filter(
                (v) => v.type === type
              ).length;
              const icon =
                type === "scooter"
                  ? "🛴"
                  : type === "bike"
                  ? "🚲"
                  : type === "car"
                  ? "🚗"
                  : type === "bus"
                  ? "🚌"
                  : "🚋";
              return (
                <div key={type} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "20px" }}>{icon}</div>
                  <div
                    style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  >
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="vehicles-list">
          {!start || !end ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--text-secondary)",
                fontSize: "14px",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗺️</div>
              <div>Select points A and B on the map</div>
              <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
                After selecting a route, we'll find available transport
              </div>
            </div>
          ) : isScanning ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "var(--text-secondary)",
                fontSize: "14px",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  border: "3px solid var(--border-color)",
                  borderTop: "3px solid var(--primary-color)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 12px",
                }}
              ></div>
              Scanning transport near the route...
            </div>
          ) : nearbyVehicles.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--text-secondary)",
                fontSize: "14px",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚫</div>
              <div>No transport found</div>
              <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
                Try selecting a different route
              </div>
            </div>
          ) : (
            nearbyVehicles.map((v) => (
              <div key={v.id} className="vehicle-item">
                <div style={{ position: "relative" }}>
                  <img src={v.image} alt="" width="56" />
                  <div
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-4px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background:
                        v.type === "scooter"
                          ? "var(--accent-color)"
                          : v.type === "bike"
                          ? "var(--success-color)"
                          : v.type === "car"
                          ? "var(--warning-color)"
                          : "var(--primary-color)",
                      border: "2px solid var(--bg-secondary)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  ></div>
                </div>
                <div style={{ marginLeft: 16, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "16px",
                      color: "var(--text-primary)",
                      marginBottom: "4px",
                    }}
                  >
                    {v.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background: "var(--bg-tertiary)",
                        fontSize: "10px",
                        fontWeight: "500",
                      }}
                    >
                      {v.operator}
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background:
                          v.type === "scooter"
                            ? "rgba(6, 182, 212, 0.2)"
                            : v.type === "bike"
                            ? "rgba(16, 185, 129, 0.2)"
                            : v.type === "car"
                            ? "rgba(245, 158, 11, 0.2)"
                            : "rgba(99, 102, 241, 0.2)",
                        color:
                          v.type === "scooter"
                            ? "var(--accent-color)"
                            : v.type === "bike"
                            ? "var(--success-color)"
                            : v.type === "car"
                            ? "var(--warning-color)"
                            : "var(--primary-color)",
                        fontSize: "10px",
                        fontWeight: "500",
                      }}
                    >
                      {v.type}
                    </span>
                  </div>

                  {/* Дополнительная информация */}
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginBottom: "8px",
                      display: "flex",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>💰 {v.price}</span>
                    {v.battery && <span>🔋 {v.battery}%</span>}
                    <span>📍 {v.distance.toFixed(1)}km</span>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        // center map on vehicle
                        if (mapRef.current)
                          mapRef.current.flyTo([v.lat, v.lon], 16, {
                            duration: 0.6,
                          });
                      }}
                      style={{
                        background:
                          "linear-gradient(135deg, var(--primary-color), var(--primary-dark))",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        color: "white",
                        fontSize: "11px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        flex: 1,
                      }}
                    >
                      📍 Show
                    </button>
                    <button
                      onClick={() =>
                        alert(
                          `🚀 Booking: ${v.title}\n\nOperator: ${v.operator}\nPrice: ${v.price}\n\n(In real app this would be a deep link to ${v.operator} app)`
                        )
                      }
                      style={{
                        background:
                          "linear-gradient(135deg, var(--success-color), #059669)",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        color: "white",
                        fontSize: "11px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        flex: 1,
                      }}
                    >
                      🚀 Book
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <hr />
        <div
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            padding: "16px",
            background:
              "linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(99, 102, 241, 0.05) 100%)",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
              color: "var(--text-primary)",
              fontWeight: "600",
            }}
          >
            <span>💡</span>
            <span>Note</span>
          </div>
          <div style={{ lineHeight: "1.5" }}>
            <strong>Demo Features:</strong>
            <br />
            • Filter transport by proximity to route
            <br />
            • Integration with Bolt, Lime, Nextbike, CarGo, GSP Beograd
            <br />
            • Show prices, battery, distances
            <br />
            • Booking simulation
            <br />
            <br />
            <strong>For Production:</strong> replace MOCK_VEHICLES with real
            APIs (GBFS, operators).
          </div>
        </div>
      </div>

      <Profile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={setUser}
      />

      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        vehicle={selectedVehicle}
      />
    </div>
  );
}
