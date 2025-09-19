// Import local icons
import carIcon from "./assets/car.png";
import scooterIcon from "./assets/scooter.png";

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
    image: scooterIcon,
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
    image: scooterIcon,
    available: true,
    distance: 0.4,
  },

  // Car Sharing - CarGo
  {
    id: "cargo-1",
    type: "car",
    operator: "CarGo",
    lat: 44.8145,
    lon: 20.451,
    title: "CarGo - VW Polo",
    battery: null,
    price: "0.25€/min + 0.8€/km",
    image: carIcon,
    available: true,
    distance: 0.2,
  },
  {
    id: "cargo-2",
    type: "car",
    operator: "CarGo",
    lat: 44.8198,
    lon: 20.459,
    title: "CarGo - Renault Clio",
    battery: null,
    price: "0.25€/min + 0.8€/km",
    image: carIcon,
    available: true,
    distance: 0.1,
  },

  // Car Sharing - LocalCarShare
  {
    id: "localcar-1",
    type: "car",
    operator: "LocalCarShare",
    lat: 44.8165,
    lon: 20.454,
    title: "LocalCar - Ford Focus",
    battery: null,
    price: "0.20€/min + 0.7€/km",
    image: carIcon,
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
export const generateVehiclesNearRoute = (start, end) => {
  if (!start || !end) return [];

  // Генерируем случайные точки вдоль маршрута
  const routeCenter = {
    lat: (start.lat + end.lat) / 2,
    lng: (start.lng + end.lng) / 2,
  };

  // Создаем несколько точек вдоль маршрута
  const numPoints = 3;
  const vehicles = [];

  for (let i = 0; i < numPoints; i++) {
    // Случайное смещение от центра маршрута
    const latOffset = (Math.random() - 0.5) * 0.01; // ~500м
    const lngOffset = (Math.random() - 0.5) * 0.01;

    const vehicleLat = routeCenter.lat + latOffset;
    const vehicleLng = routeCenter.lng + lngOffset;

    // Вычисляем расстояние от центра маршрута
    const distance =
      Math.sqrt(
        Math.pow(vehicleLat - routeCenter.lat, 2) +
          Math.pow(vehicleLng - routeCenter.lng, 2)
      ) * 111; // Примерно в км

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
        image: scooterIcon,
      },
      {
        type: "car",
        operator: "CarGo",
        title: `CarGo - VW Polo`,
        battery: null,
        price: "0.25€/min + 0.8€/km",
        image: carIcon,
      },
      {
        type: "car",
        operator: "LocalCarShare",
        title: `LocalCar - Renault Clio`,
        battery: null,
        price: "0.20€/min + 0.6€/km",
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
