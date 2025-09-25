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
import {
  MOCK_VEHICLES,
  generateVehiclesNearRoute,
  getNearbyPublicTransport,
  calculateTransportTimes,
} from "./mockData";
import Profile from "./Profile";
import { Link } from "react-router-dom";
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
import cycleIcon from "./assets/cycle.png";
import busIcon from "./assets/bus.svg";
import tramIcon from "./assets/tram.svg";
import taxiIcon from "./assets/taxiUpView.svg";

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
            ? cycleIcon
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

// Функция для получения информации о типе транспорта
const getTransportInfo = (type) => {
  const transportInfo = {
    car: {
      name: "Car Sharing",
      icon: "🚗",
      color: "#3b82f6",
      description: "Toyota Fortuner GR",
    },
    publicTransport: {
      name: "Public Transport",
      icon: "🚌",
      color: "#8b5cf6",
      description: "Bus, Tram, Trolley",
    },
    taxi: {
      name: "Taxi",
      icon: "🚕",
      color: "#f59e0b",
      description: "YandexGo",
    },
    scooter: {
      name: "E-Scooter",
      icon: "🛴",
      color: "#06b6d4",
      description: "Shared Scooter",
    },
    bike: {
      name: "Bicycle",
      icon: "🚲",
      color: "#10b981",
      description: "Shared Bike",
    },
    walking: {
      name: "Walking",
      icon: "🚶",
      color: "#6b7280",
      description: "On Foot",
    },
  };
  return (
    transportInfo[type] || {
      name: "Unknown",
      icon: "❓",
      color: "#6b7280",
      description: "Unknown",
    }
  );
};

// Icons for public transport stops
const publicTransportIconFor = (type) => {
  // Special case for taxi - no background, just the car image
  if (type === "taxi") {
    return L.divIcon({
      html: `
        <div style="
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <img src="${taxiIcon}" style="
            height: 108px;
            object-fit: contain;
          " />
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #22c55e;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          "></div>
        </div>
      `,
      className: "taxi-icon",
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
  }

  // For other transport types - with colored background
  const iconColor =
    type === "bus"
      ? "#3b82f6"
      : type === "tram"
      ? "#8b5cf6"
      : type === "trolley"
      ? "#06b6d4"
      : "#6366f1";

  const iconImage =
    type === "bus" ? busIcon : type === "tram" ? tramIcon : busIcon;

  const htmlContent = `
    <div style="
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: linear-gradient(135deg, ${iconColor}, ${iconColor}dd);
      border: 2px solid white;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <img src="${iconImage}" style="
        width: 24px;
        height: 24px;
        filter: brightness(0) invert(1);
        object-fit: contain;
      " />
      <div style="
        position: absolute;
        top: -4px;
        right: -4px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #22c55e;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      "></div>
    </div>
  `;

  return L.divIcon({
    html: htmlContent,
    className: "public-transport-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

function MapClickHandler({
  setStart,
  setEnd,
  start,
  end,
  clearRoute,
  clearTransport,
}) {
  useMapEvents({
    click(e) {
      const latlng = e.latlng;
      if (!start) {
        setStart(latlng);
      } else if (!end) {
        setEnd(latlng);
      } else {
        // both points exist — reset and set new start
        setStart(latlng);
        setEnd(null);
        clearRoute();
        clearTransport(); // Clear transport data when resetting
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
  navigationRoute,
  navigationTarget,
  nearbyVehicles,
  publicTransport,
  setStart,
  setEnd,
  clearRoute,
  clearTransport,
  clearNavigationRoute,
  navigateToTarget,
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
        clearTransport={clearTransport}
      />

      {start && (
        <Marker position={[start.lat, start.lng]}>
          <Popup>
            <div>
              <strong>Point A</strong>
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
              <strong>Point B</strong>
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

      {/* Navigation route to transport/stop */}
      {navigationRoute && navigationRoute.length > 0 && (
        <Polyline
          positions={navigationRoute}
          color="#f59e0b"
          weight={3}
          opacity={0.9}
          dashArray="10, 5"
          className="navigation-line"
        />
      )}

      {/* Navigation target marker */}
      {navigationTarget && (
        <Marker
          position={[
            navigationTarget.lat,
            navigationTarget.lon || navigationTarget.lng,
          ]}
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
                <strong style={{ fontSize: "14px" }}>
                  🎯 Navigation Target
                </strong>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <strong>
                    {navigationTarget.name || navigationTarget.title}
                  </strong>
                </div>
                <div>Type: {navigationTarget.type}</div>
                <div>
                  Coordinates: {navigationTarget.lat.toFixed(6)},{" "}
                  {(navigationTarget.lon || navigationTarget.lng).toFixed(6)}
                </div>
              </div>
              <button
                onClick={clearNavigationRoute}
                style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  border: "none",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                ❌ Clear Navigation
              </button>
            </div>
          </Popup>
        </Marker>
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
                <div> {v.operator}</div>
                <div> {v.price}</div>
                {v.battery && <div>🔋 {v.battery}%</div>}
                <div> {v.distance.toFixed(1)}km away</div>
              </div>

              <button
                onClick={() =>
                  alert(
                    `Booking: ${v.title}\n\nOperator: ${v.operator}\nPrice: ${v.price}\n\n${v.operator})`
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
                Book
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Public Transport Stops */}
      {publicTransport.stops.map((stop) => (
        <Marker
          key={stop.id}
          position={[stop.lat, stop.lon]}
          icon={publicTransportIconFor(stop.type)}
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
                <strong style={{ fontSize: "14px" }}>{stop.name}</strong>
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: "8px",
                    fontSize: "10px",
                    background:
                      stop.type === "bus"
                        ? "rgba(59, 130, 246, 0.2)"
                        : stop.type === "tram"
                        ? "rgba(139, 92, 246, 0.2)"
                        : stop.type === "trolley"
                        ? "rgba(6, 182, 212, 0.2)"
                        : stop.type === "taxi"
                        ? "rgba(245, 158, 11, 0.2)"
                        : "rgba(99, 102, 241, 0.2)",
                    color:
                      stop.type === "bus"
                        ? "#3b82f6"
                        : stop.type === "tram"
                        ? "#8b5cf6"
                        : stop.type === "trolley"
                        ? "#06b6d4"
                        : stop.type === "taxi"
                        ? "#f59e0b"
                        : "#6366f1",
                  }}
                >
                  {stop.type}
                </span>
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  marginBottom: "8px",
                }}
              >
                {stop.type === "taxi" ? (
                  <>
                    <div>🚕 {stop.operator}</div>
                    <div>💰 {stop.price}</div>
                    <div>⏰ ETA: {stop.nextArrival}</div>
                    <div>📍 {stop.distance.toFixed(1)}km away</div>
                  </>
                ) : (
                  <>
                    <div>🚌 Routes: {stop.routes.join(", ")}</div>
                    <div>⏰ Next: {stop.nextArrival}</div>
                    <div>🏢 {stop.operator}</div>
                  </>
                )}
              </div>

              <button
                onClick={() =>
                  stop.type === "taxi"
                    ? alert(
                        `🚕 YandexGo Taxi\n\nOperator: ${
                          stop.operator
                        }\nPrice: ${stop.price}\nETA: ${
                          stop.nextArrival
                        }\nDistance: ${stop.distance.toFixed(1)}km\n\n`
                      )
                    : navigateToTarget(stop, stop.type)
                }
                style={{
                  background:
                    stop.type === "taxi"
                      ? "linear-gradient(135deg, #f59e0b, #d97706)"
                      : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
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
                {stop.type === "taxi" ? "🚕 Book Taxi" : "Navigate"}
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Taxi Stops */}
      {publicTransport.taxis.map((taxi) => (
        <Marker
          key={taxi.id}
          position={[taxi.lat, taxi.lon]}
          icon={publicTransportIconFor(taxi.type)}
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
                <strong style={{ fontSize: "14px" }}>{taxi.name}</strong>
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: "8px",
                    fontSize: "10px",
                    background: "rgba(245, 158, 11, 0.2)",
                    color: "#f59e0b",
                  }}
                >
                  taxi
                </span>
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  marginBottom: "8px",
                }}
              >
                <div>🚕 {taxi.operator}</div>
                <div>💰 {taxi.price}</div>
                <div>⏰ ETA: {taxi.nextArrival}</div>
                <div>📍 {taxi.distance.toFixed(1)}km away</div>
              </div>

              <button
                onClick={() =>
                  alert(
                    `🚕 YandexGo Taxi\n\nOperator: ${taxi.operator}\nPrice: ${
                      taxi.price
                    }\nETA: ${
                      taxi.nextArrival
                    }\nDistance: ${taxi.distance.toFixed(1)}km\n\n`
                  )
                }
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
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
                🚕 Book Taxi
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
  const [publicTransport, setPublicTransport] = useState({
    stops: [],
    routes: [],
    taxis: [],
  });
  const [transportTimes, setTransportTimes] = useState(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedVehicle, _setSelectedVehicle] = useState(null);
  const [navigationRoute, setNavigationRoute] = useState(null); // Route to transport/stop
  const [navigationTarget, setNavigationTarget] = useState(null); // Target transport/stop
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [user, setUser] = useState(() => {
    // Load user profile from localStorage or use default
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
    return {
      fullName: "Alexander Petrov",
      email: "alex.petrov@email.com",
      phone: "+381 60 123 4567",
      city: "Belgrade",
      preferences: ["Scooters", "Bicycles", "Car Sharing"],
    };
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

      // Clear all transport data when starting new route
      setPublicTransport({ stops: [], routes: [], taxis: [] });
      setTransportTimes(null);

      try {
        // OSRM public demo server — lon,lat;lon,lat
        const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
        const resp = await axios.get(url);
        if (resp.data && resp.data.routes && resp.data.routes.length > 0) {
          const coords = resp.data.routes[0].geometry.coordinates; // [lon,lat] pairs
          // convert to [lat, lon] for Leaflet Polyline
          const latlngs = coords.map(([lon, lat]) => [lat, lon]);
          setRoute(latlngs);

          // Load public transport data
          const transportData = getNearbyPublicTransport(start, end);
          setPublicTransport(transportData);

          // Calculate transport times
          const times = calculateTransportTimes(start, end);
          setTransportTimes(times);

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
          // Fallback: create a simple straight line route
          console.warn("OSRM route not found, using fallback straight line");
          const fallbackRoute = [
            [start.lat, start.lng],
            [end.lat, end.lng],
          ];
          setRoute(fallbackRoute);

          // Load public transport data
          const transportData = getNearbyPublicTransport(start, end);
          setPublicTransport(transportData);

          // Calculate transport times
          const times = calculateTransportTimes(start, end);
          setTransportTimes(times);

          setIsScanning(false);
        }
      } catch (err) {
        console.error("OSRM error:", err);
        // Fallback: create a simple straight line route
        console.warn("OSRM unavailable, using fallback straight line");
        const fallbackRoute = [
          [start.lat, start.lng],
          [end.lat, end.lng],
        ];
        setRoute(fallbackRoute);

        // Load public transport data
        const transportData = getNearbyPublicTransport(start, end);
        setPublicTransport(transportData);

        // Calculate transport times
        const times = calculateTransportTimes(start, end);
        setTransportTimes(times);

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
    setTransportTimes(null);
    setPublicTransport({ stops: [], routes: [], taxis: [] });
    setNavigationRoute(null);
    setNavigationTarget(null);
  };

  const handleStartAddressSelect = (address) => {
    setStart({ lat: address.lat, lng: address.lng });
    setStartAddress(address.name);
    // Clear transport data when changing start point
    setPublicTransport({ stops: [], routes: [], taxis: [] });
    setTransportTimes(null);
  };

  const handleEndAddressSelect = (address) => {
    setEnd({ lat: address.lat, lng: address.lng });
    setEndAddress(address.name);
    // Clear transport data when changing end point
    setPublicTransport({ stops: [], routes: [], taxis: [] });
    setTransportTimes(null);
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("userProfile", JSON.stringify(updatedUser));
  };

  const clearStartAddress = () => {
    setStart(null);
    setStartAddress("");
    // Clear transport data when clearing start point
    setPublicTransport({ stops: [], routes: [], taxis: [] });
    setTransportTimes(null);
  };

  const clearEndAddress = () => {
    setEnd(null);
    setEndAddress("");
    // Clear transport data when clearing end point
    setPublicTransport({ stops: [], routes: [], taxis: [] });
    setTransportTimes(null);
  };

  const clearTransport = () => {
    setPublicTransport({ stops: [], routes: [], taxis: [] });
    setTransportTimes(null);
  };

  // Function to navigate to a transport/stop
  const navigateToTarget = async (target, targetType) => {
    if (!start) {
      alert("Please select a starting point first!");
      return;
    }

    try {
      setNavigationTarget({ ...target, type: targetType });

      // Use OSRM to get route to target
      const url = `https://router.project-osrm.org/route/v1/walking/${
        start.lng
      },${start.lat};${target.lon || target.lng},${
        target.lat
      }?overview=full&geometries=geojson`;
      const resp = await axios.get(url);

      if (resp.data && resp.data.routes && resp.data.routes.length > 0) {
        const coords = resp.data.routes[0].geometry.coordinates;
        const latlngs = coords.map(([lon, lat]) => [lat, lon]);
        setNavigationRoute(latlngs);

        // Fit map to show both start and target
        if (mapRef.current) {
          const map = mapRef.current;
          const bounds = latlngs.reduce(
            (b, c) => (b ? b.extend(c) : L.latLngBounds(c, c)),
            null
          );
          if (bounds) map.fitBounds(bounds, { padding: [50, 50] });
        }
      } else {
        // Fallback: straight line
        const fallbackRoute = [
          [start.lat, start.lng],
          [target.lat, target.lon || target.lng],
        ];
        setNavigationRoute(fallbackRoute);
      }
    } catch (err) {
      console.error("Navigation route error:", err);
      // Fallback: straight line
      const fallbackRoute = [
        [start.lat, start.lng],
        [target.lat, target.lon || target.lng],
      ];
      setNavigationRoute(fallbackRoute);
    }
  };

  // Function to clear navigation route
  const clearNavigationRoute = () => {
    setNavigationRoute(null);
    setNavigationTarget(null);
  };

  return (
    <div className="app-root">
      <div className="map-pane">
        <MapComponent
          start={start}
          end={end}
          route={route}
          navigationRoute={navigationRoute}
          navigationTarget={navigationTarget}
          nearbyVehicles={nearbyVehicles}
          publicTransport={publicTransport}
          setStart={setStart}
          setEnd={setEnd}
          clearRoute={() => setRoute([])}
          clearTransport={clearTransport}
          clearNavigationRoute={clearNavigationRoute}
          navigateToTarget={navigateToTarget}
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
          <h2 style={{ margin: 0 }}>Hop & Go</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/payment">
              <button
                className="profile-button"
                style={{
                  background:
                    "linear-gradient(135deg, var(--success-color), #059669)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: "white",
                }}
              >
                💳 Payment
              </button>
            </Link>

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
              👤{" "}
              {user.fullName
                ? user.fullName.split(" ")[0]
                : user.name?.split(" ")[0] || "User"}
            </button>
          </div>
        </div>
        <p>
          {!start && !end && "Select point A on the map or enter an address"}
          {start && !end && "Now select point B on the map or enter an address"}
          {start && end && isScanning && "🔍 Scanning area near the route..."}
          {start && end && !isScanning && "Route built! Transport found!"}
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
              Point A (Start)
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
              Point B (End)
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

        {/* Fastest Transport Option */}
        {transportTimes && transportTimes.fastest && (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              border: "3px solid #f59e0b",
              borderRadius: "16px",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(245, 158, 11, 0.3)",
            }}
          >
            {/* Decorative elements */}
            <div
              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                borderRadius: "50%",
                opacity: 0.1,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-20px",
                left: "-20px",
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                borderRadius: "50%",
                opacity: 0.05,
              }}
            />

            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "16px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  background: "white",
                  borderRadius: "50%",
                  width: "56px",
                  height: "56px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                  border: "3px solid #f59e0b",
                }}
              >
                {getTransportInfo(transportTimes.fastest.type).icon}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0",
                      color: "#92400e",
                      fontSize: "18px",
                      fontWeight: "800",
                      textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    FASTEST OPTION
                  </h3>
                </div>
                <p
                  style={{
                    margin: "0 0 4px 0",
                    color: "#b45309",
                    fontSize: "16px",
                    fontWeight: "700",
                  }}
                >
                  {getTransportInfo(transportTimes.fastest.type).name}
                </p>
                <p
                  style={{
                    margin: "0",
                    color: "#a16207",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {getTransportInfo(transportTimes.fastest.type).description}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "16px",
                  borderRadius: "12px",
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  border: "2px solid #fbbf24",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "900",
                    color: "#92400e",
                    marginBottom: "4px",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  {transportTimes.fastest.time}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#a16207",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Minutes
                </div>
              </div>
              <div
                style={{
                  background: "white",
                  padding: "16px",
                  borderRadius: "12px",
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  border: "2px solid #fbbf24",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "900",
                    color: "#92400e",
                    marginBottom: "4px",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  {transportTimes.fastest.distance}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#a16207",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Kilometers
                </div>
              </div>
            </div>

            {/* Bottom accent */}
            <div
              style={{
                marginTop: "16px",
                height: "4px",
                background: "linear-gradient(90deg, #fbbf24, #f59e0b, #d97706)",
                borderRadius: "2px",
                position: "relative",
                zIndex: 1,
              }}
            />
          </div>
        )}

        <div
          style={{
            marginTop: 20,
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => {
              setRoute([]);
              setPublicTransport({ stops: [], routes: [], taxis: [] });
              setTransportTimes(null);
            }}
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
            Remove Route
          </button>
          {navigationRoute && (
            <button
              onClick={clearNavigationRoute}
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                border: "1px solid #f59e0b",
                color: "white",
              }}
            >
              ❌ Clear Navigation
            </button>
          )}
          <button
            onClick={clearAll}
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              border: "1px solid #8b5cf6",
            }}
          >
            Reset Points
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
              ? "Select Route"
              : isScanning
              ? "🔍 Scanning..."
              : "Near Route"}
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

        {/* Transport type statistics */}
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
            {["scooter", "bike", "car", "bus", "tram", "taxi"].map((type) => {
              let count = nearbyVehicles.filter((v) => v.type === type).length;

              // Add public transport stops count
              if (type === "bus" || type === "tram") {
                count += publicTransport.stops.filter(
                  (stop) => stop.type === type
                ).length;
              }

              // Add taxi count
              if (type === "taxi") {
                count += publicTransport.taxis.length;
              }

              const icon =
                type === "scooter"
                  ? "🛴"
                  : type === "bike"
                  ? "🚲"
                  : type === "car"
                  ? "🚗"
                  : type === "bus"
                  ? "🚌"
                  : type === "tram"
                  ? "🚋"
                  : "🚕";
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

        {/* All Transport Options with Times */}
        {transportTimes && transportTimes.times && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              background:
                "linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(16, 185, 129, 0.05) 100%)",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
            }}
          >
            <h4
              style={{
                margin: "0 0 12px 0",
                fontSize: "14px",
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              All Transport Options
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {Object.entries(transportTimes.times)
                .sort(([, a], [, b]) => a - b) // Sort by time
                .map(([type, time]) => {
                  const info = getTransportInfo(type);
                  const isFastest = transportTimes.fastest.type === type;
                  return (
                    <div
                      key={type}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: isFastest
                          ? "linear-gradient(135deg, #f0f9ff, #e0f2fe)"
                          : "white",
                        borderRadius: "8px",
                        border: isFastest
                          ? "2px solid #0ea5e9"
                          : "1px solid var(--border-color)",
                        boxShadow: isFastest
                          ? "0 2px 8px rgba(14, 165, 233, 0.2)"
                          : "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "18px",
                            background: isFastest ? "white" : "#f8fafc",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          }}
                        >
                          {info.icon}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: isFastest ? "700" : "600",
                              color: isFastest
                                ? "#0c4a6e"
                                : "var(--text-primary)",
                            }}
                          >
                            {info.name}
                            {isFastest}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text-secondary)",
                              fontWeight: "500",
                            }}
                          >
                            {info.description}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {transportTimes.fastest.distance} km
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: isFastest ? "#0c4a6e" : "var(--text-primary)",
                        }}
                      >
                        {time} min
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Public Transport Routes */}
        {start && end && !isScanning && publicTransport.routes.length > 0 && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              background:
                "linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(59, 130, 246, 0.05) 100%)",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
            }}
          >
            <h4
              style={{
                margin: "0 0 12px 0",
                fontSize: "14px",
                color: "var(--text-primary)",
              }}
            >
              🚌 Public Transport Routes
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {publicTransport.routes.slice(0, 3).map((route) => (
                <div
                  key={route.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "4px",
                        background:
                          route.type === "bus"
                            ? "#3b82f6"
                            : route.type === "tram"
                            ? "#8b5cf6"
                            : route.type === "trolley"
                            ? "#06b6d4"
                            : "#6366f1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      <img
                        src={
                          route.type === "bus"
                            ? busIcon
                            : route.type === "tram"
                            ? tramIcon
                            : busIcon
                        }
                        style={{
                          width: "16px",
                          height: "16px",
                          filter: "brightness(0) invert(1)",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "var(--text-primary)",
                        }}
                      >
                        Route {route.number}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {route.duration} • {route.price}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Find the nearest stop for this route
                      const nearestStop = publicTransport.stops.find(
                        (stop) =>
                          stop.routes && stop.routes.includes(route.number)
                      );

                      if (nearestStop) {
                        navigateToTarget(nearestStop, route.type);
                      } else {
                        alert("No nearby stops found for this route.");
                      }
                    }}
                    style={{
                      background: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "10px",
                      color: "#3b82f6",
                      cursor: "pointer",
                    }}
                  >
                    Navigate
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Taxi Information */}
        {start && end && !isScanning && publicTransport.taxis.length > 0 && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              background:
                "linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(245, 158, 11, 0.05) 100%)",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
            }}
          >
            <h4
              style={{
                margin: "0 0 12px 0",
                fontSize: "14px",
                color: "var(--text-primary)",
              }}
            >
              🚕 Available Taxis
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {publicTransport.taxis.slice(0, 3).map((taxi) => (
                <div
                  key={taxi.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "4px",
                        background: "#f59e0b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      <img
                        src={taxiIcon}
                        style={{
                          width: "16px",
                          height: "16px",
                          filter: "brightness(0) invert(1)",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "var(--text-primary)",
                        }}
                      >
                        {taxi.operator}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        ETA: {taxi.nextArrival} • {taxi.price}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      alert(
                        `🚕 YandexGo Taxi\n\nOperator: ${
                          taxi.operator
                        }\nPrice: ${taxi.price}\nETA: ${
                          taxi.nextArrival
                        }\nDistance: ${taxi.distance.toFixed(1)}km\n\n`
                      )
                    }
                    style={{
                      background: "rgba(245, 158, 11, 0.1)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "10px",
                      color: "#f59e0b",
                      cursor: "pointer",
                    }}
                  >
                    Book
                  </button>
                </div>
              ))}
            </div>
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
                  <img
                    src={v.image}
                    alt=""
                    style={{
                      objectFit: "contain",
                      width: v.type === "scooter" ? 160 : 160,
                      height: v.type === "scooter" ? "auto" : "auto",
                      display: "block",
                    }}
                  />
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
                    <span> {v.price}</span>
                    {v.battery && <span>🔋 {v.battery}%</span>}
                    <span>{v.distance.toFixed(1)}km</span>
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
                      Show
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
      </div>

      <Profile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
      />

      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        vehicle={selectedVehicle}
        onNavigate={(vehicle) => navigateToTarget(vehicle, vehicle.type)}
      />
    </div>
  );
}
