// Import local icons
import carIcon from "./assets/car.png";
import scooterIcon from "./assets/scooter.png";
import car2 from "./assets/car2.png";
import cycleIcon from "./assets/cycle.png";

// Реалистичные данные по Белграду (Serbia) с различными сервисами микромобильности
export const MOCK_VEHICLES = [
  // Bolt Scooters
  {
    id: "bolt-scooter-1",
    type: "scooter",
    operator: "Bolt",
    lat: 44.8179,
    lon: 20.456,
    title: "Bolt Scooter #B12",
    battery: 85,
    price: "0.15€/min",
    image: scooterIcon,
    available: true,
    distance: 0.2,
  },
  {
    id: "bolt-scooter-2",
    type: "scooter",
    operator: "Bolt",
    lat: 44.8195,
    lon: 20.461,
    title: "Bolt Scooter #B34",
    battery: 92,
    price: "0.15€/min",
    image: scooterIcon,
    available: true,
    distance: 0.3,
  },
  {
    id: "bolt-scooter-3",
    type: "scooter",
    operator: "Bolt",
    lat: 44.8155,
    lon: 20.452,
    title: "Bolt Scooter #B56",
    battery: 78,
    price: "0.15€/min",
    image: scooterIcon,
    available: true,
    distance: 0.4,
  },

  // Lime Scooters
  {
    id: "lime-scooter-1",
    type: "scooter",
    operator: "Lime",
    lat: 44.8188,
    lon: 20.462,
    title: "Lime Scooter #L78",
    battery: 88,
    price: "0.18€/min",
    image: scooterIcon,
    available: true,
    distance: 0.1,
  },
  {
    id: "lime-scooter-2",
    type: "scooter",
    operator: "Lime",
    lat: 44.8201,
    lon: 20.458,
    title: "Lime Scooter #L90",
    battery: 95,
    price: "0.18€/min",
    image: scooterIcon,
    available: true,
    distance: 0.2,
  },

  // Nextbike Stations
  {
    id: "nextbike-1",
    type: "bike",
    operator: "Nextbike",
    lat: 44.8125,
    lon: 20.448,
    title: "Nextbike Station (8 bikes)",
    battery: null,
    price: "1€/hour",
    image: cycleIcon,
    available: true,
    distance: 0.3,
  },
  {
    id: "nextbike-2",
    type: "bike",
    operator: "Nextbike",
    lat: 44.8215,
    lon: 20.465,
    title: "Nextbike Station (5 bikes)",
    battery: null,
    price: "1€/hour",
    image: cycleIcon,
    available: true,
    distance: 0.4,
  },

  // Bicycle Sharing - LocalBike
  {
    id: "localbike-1",
    type: "bike",
    operator: "LocalBike",
    lat: 44.8142,
    lon: 20.453,
    title: "LocalBike - City Bike",
    battery: null,
    price: "0.5€/hour",
    image: cycleIcon,
    available: true,
    distance: 0.25,
  },
  {
    id: "localbike-2",
    type: "bike",
    operator: "LocalBike",
    lat: 44.8185,
    lon: 20.461,
    title: "LocalBike - Electric Bike",
    battery: 75,
    price: "0.8€/hour",
    image: cycleIcon,
    available: true,
    distance: 0.15,
  },

  // Car Sharing - Only Toyota Fortuner GR
  {
    id: "carshare-toyota-fortuner-gr-1",
    type: "car",
    operator: "Toyota Share",
    lat: 44.8165,
    lon: 20.454,
    title: "Toyota Fortuner GR",
    battery: null,
    price: "0.35€/min + 1.0€/km",
    image: car2,
    available: true,
    distance: 0.15,
  },

  // Public Transport Stops
  {
    id: "bus-1",
    type: "bus",
    operator: "GSP Beograd",
    lat: 44.8172,
    lon: 20.457,
    title: "Bus Stop - Line 24, 31",
    battery: null,
    price: "89 RSD (0.75€)",
    image: scooterIcon,
    available: true,
    distance: 0.1,
  },
  {
    id: "tram-1",
    type: "tram",
    operator: "GSP Beograd",
    lat: 44.818,
    lon: 20.46,
    title: "Tram Stop - Line 2, 5",
    battery: null,
    price: "89 RSD (0.75€)",
    image: scooterIcon,
    available: true,
    distance: 0.05,
  },
];

// Функция для генерации транспорта рядом с маршрутом
export const generateVehiclesNearRoute = (start /*, end */) => {
  // Генерируем транспорт рядом с точкой старта, чтобы было похоже на реальный UX
  if (!start) return [];

  const center = { lat: start.lat, lng: start.lng };
  const numPoints = 6; // немного больше объектов рядом со стартом
  const vehicles = [];

  for (let i = 0; i < numPoints; i++) {
    // Случайное смещение от точки старта в небольшом радиусе (~300–600м)
    const latOffset = (Math.random() - 0.5) * 0.006; // ~600 м по широте
    const lngOffset = (Math.random() - 0.5) * 0.006; // ~600 м по долготе

    const vehicleLat = center.lat + latOffset;
    const vehicleLng = center.lng + lngOffset;

    // Вычисляем расстояние от точки старта
    const distance =
      Math.sqrt(
        Math.pow(vehicleLat - center.lat, 2) +
          Math.pow(vehicleLng - center.lng, 2)
      ) * 111; // км

    // Создаем разные типы транспорта
    const vehicleTypes = [
      {
        type: "scooter",
        operator: "Bolt",
        title: `Bolt Scooter #B${Math.floor(Math.random() * 100)}`,
        battery: Math.floor(Math.random() * 40) + 60, // 60-100%
        price: "0.15€/min",
        image: scooterIcon,
      },
      {
        type: "scooter",
        operator: "Lime",
        title: `Lime Scooter #L${Math.floor(Math.random() * 100)}`,
        battery: Math.floor(Math.random() * 40) + 60,
        price: "0.18€/min",
        image: scooterIcon,
      },
      {
        type: "bike",
        operator: "Nextbike",
        title: `Nextbike #N${Math.floor(Math.random() * 100)}`,
        battery: null,
        price: "0.10€/min",
        image: cycleIcon,
      },
      {
        type: "bike",
        operator: "LocalBike",
        title: `LocalBike - City Bike`,
        battery: null,
        price: "0.5€/hour",
        image: cycleIcon,
      },
      {
        type: "bike",
        operator: "LocalBike",
        title: `LocalBike - Electric Bike`,
        battery: Math.floor(Math.random() * 40) + 60, // 60-100%
        price: "0.8€/hour",
        image: cycleIcon,
      },
      {
        type: "car",
        operator: "Toyota Share",
        title: `Toyota Fortuner GR`,
        battery: null,
        price: "0.35€/min + 1.0€/km",
        image: carIcon,
      },
    ];

    const vehicleTemplate =
      vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];

    vehicles.push({
      id: `${vehicleTemplate.type}-${i}-${Date.now()}`,
      type: vehicleTemplate.type,
      operator: vehicleTemplate.operator,
      lat: vehicleLat,
      lon: vehicleLng,
      title: vehicleTemplate.title,
      battery: vehicleTemplate.battery,
      price: vehicleTemplate.price,
      image: vehicleTemplate.image,
      available: true,
      distance: distance,
    });
  }

  return vehicles;
};

// Старая функция для обратной совместимости (теперь не используется)
export const filterVehiclesNearRoute = (vehicles, start, end) => {
  return generateVehiclesNearRoute(start, end);
};
