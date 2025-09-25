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

// Mock данные для общественного транспорта Сербии
export const PUBLIC_TRANSPORT_STOPS = [
  // Автобусные остановки в Белграде
  {
    id: "bus-stop-1",
    type: "bus",
    name: "Trg Republike",
    lat: 44.8176,
    lon: 20.4565,
    routes: ["15", "31", "78", "83"],
    operator: "GSP Beograd",
    nextArrival: "3 min",
    status: "active",
  },
  {
    id: "bus-stop-2",
    type: "bus",
    name: "Studentski trg",
    lat: 44.8192,
    lon: 20.4578,
    routes: ["15", "31", "78"],
    operator: "GSP Beograd",
    nextArrival: "7 min",
    status: "active",
  },
  {
    id: "bus-stop-3",
    type: "bus",
    name: "Knez Mihailova",
    lat: 44.8168,
    lon: 20.4589,
    routes: ["15", "31", "83"],
    operator: "GSP Beograd",
    nextArrival: "2 min",
    status: "active",
  },
  {
    id: "bus-stop-4",
    type: "bus",
    name: "Terazije",
    lat: 44.8156,
    lon: 20.4601,
    routes: ["15", "31", "78", "83"],
    operator: "GSP Beograd",
    nextArrival: "5 min",
    status: "active",
  },
  {
    id: "bus-stop-5",
    type: "bus",
    name: "Slavija",
    lat: 44.8028,
    lon: 20.4656,
    routes: ["15", "31", "78"],
    operator: "GSP Beograd",
    nextArrival: "4 min",
    status: "active",
  },
  {
    id: "bus-stop-6",
    type: "bus",
    name: "Vukov spomenik",
    lat: 44.8067,
    lon: 20.4701,
    routes: ["15", "31", "83"],
    operator: "GSP Beograd",
    nextArrival: "6 min",
    status: "active",
  },

  // Трамвайные остановки
  {
    id: "tram-stop-1",
    type: "tram",
    name: "Trg Republike",
    lat: 44.8174,
    lon: 20.4563,
    routes: ["2", "3", "5"],
    operator: "GSP Beograd",
    nextArrival: "8 min",
    status: "active",
  },
  {
    id: "tram-stop-2",
    type: "tram",
    name: "Studentski trg",
    lat: 44.819,
    lon: 20.4576,
    routes: ["2", "3"],
    operator: "GSP Beograd",
    nextArrival: "12 min",
    status: "active",
  },
  {
    id: "tram-stop-3",
    type: "tram",
    name: "Terazije",
    lat: 44.8154,
    lon: 20.4599,
    routes: ["2", "3", "5"],
    operator: "GSP Beograd",
    nextArrival: "9 min",
    status: "active",
  },

  // Троллейбусные остановки
  {
    id: "trolley-stop-1",
    type: "trolley",
    name: "Slavija",
    lat: 44.8026,
    lon: 20.4654,
    routes: ["19", "21", "22"],
    operator: "GSP Beograd",
    nextArrival: "11 min",
    status: "active",
  },
  {
    id: "trolley-stop-2",
    type: "trolley",
    name: "Vukov spomenik",
    lat: 44.8065,
    lon: 20.4699,
    routes: ["19", "21"],
    operator: "GSP Beograd",
    nextArrival: "7 min",
    status: "active",
  },

  // Остановки в Новом Саде
  {
    id: "ns-bus-stop-1",
    type: "bus",
    name: "Trg slobode",
    lat: 45.2671,
    lon: 19.8335,
    routes: ["1", "3", "7"],
    operator: "JGSP Novi Sad",
    nextArrival: "4 min",
    status: "active",
  },
  {
    id: "ns-bus-stop-2",
    type: "bus",
    name: "Centar",
    lat: 45.2656,
    lon: 19.8356,
    routes: ["1", "3", "7", "12"],
    operator: "JGSP Novi Sad",
    nextArrival: "6 min",
    status: "active",
  },

  // Такси YandexGo
  {
    id: "taxi-yandexgo-1",
    type: "taxi",
    name: "YandexGo",
    lat: 44.817,
    lon: 20.456,
    routes: [], // Такси не имеют маршрутов
    operator: "YandexGo",
    nextArrival: "2 min",
    status: "active",
    price: "150-300 RSD",
    distance: 0.1,
    available: true,
  },
  {
    id: "taxi-yandexgo-2",
    type: "taxi",
    name: "YandexGo",
    lat: 44.8185,
    lon: 20.458,
    routes: [], // Такси не имеют маршрутов
    operator: "YandexGo",
    nextArrival: "4 min",
    status: "active",
    price: "150-300 RSD",
    distance: 0.2,
    available: true,
  },
  {
    id: "taxi-yandexgo-3",
    type: "taxi",
    name: "YandexGo",
    lat: 44.815,
    lon: 20.461,
    routes: [], // Такси не имеют маршрутов
    operator: "YandexGo",
    nextArrival: "6 min",
    status: "active",
    price: "150-300 RSD",
    distance: 0.3,
    available: true,
  },
  {
    id: "taxi-yandexgo-4",
    type: "taxi",
    name: "YandexGo",
    lat: 44.803,
    lon: 20.466,
    routes: [], // Такси не имеют маршрутов
    operator: "YandexGo",
    nextArrival: "3 min",
    status: "active",
    price: "150-300 RSD",
    distance: 0.15,
    available: true,
  },
  {
    id: "taxi-yandexgo-5",
    type: "taxi",
    name: "YandexGo",
    lat: 44.807,
    lon: 20.47,
    routes: [], // Такси не имеют маршрутов
    operator: "YandexGo",
    nextArrival: "5 min",
    status: "active",
    price: "150-300 RSD",
    distance: 0.25,
    available: true,
  },
];

// Маршруты общественного транспорта
export const PUBLIC_TRANSPORT_ROUTES = [
  {
    id: "route-bus-15",
    type: "bus",
    number: "15",
    name: "Trg Republike - Slavija",
    operator: "GSP Beograd",
    stops: [
      { lat: 44.8176, lon: 20.4565, name: "Trg Republike" },
      { lat: 44.8192, lon: 20.4578, name: "Studentski trg" },
      { lat: 44.8156, lon: 20.4601, name: "Terazije" },
      { lat: 44.8028, lon: 20.4656, name: "Slavija" },
    ],
    duration: "12 min",
    frequency: "8-12 min",
    price: "89 RSD",
  },
  {
    id: "route-bus-31",
    type: "bus",
    number: "31",
    name: "Studentski trg - Vukov spomenik",
    operator: "GSP Beograd",
    stops: [
      { lat: 44.8192, lon: 20.4578, name: "Studentski trg" },
      { lat: 44.8168, lon: 20.4589, name: "Knez Mihailova" },
      { lat: 44.8067, lon: 20.4701, name: "Vukov spomenik" },
    ],
    duration: "8 min",
    frequency: "6-10 min",
    price: "89 RSD",
  },
  {
    id: "route-tram-2",
    type: "tram",
    number: "2",
    name: "Trg Republike - Terazije",
    operator: "GSP Beograd",
    stops: [
      { lat: 44.8174, lon: 20.4563, name: "Trg Republike" },
      { lat: 44.819, lon: 20.4576, name: "Studentski trg" },
      { lat: 44.8154, lon: 20.4599, name: "Terazije" },
    ],
    duration: "6 min",
    frequency: "5-8 min",
    price: "89 RSD",
  },
  {
    id: "route-trolley-19",
    type: "trolley",
    number: "19",
    name: "Slavija - Vukov spomenik",
    operator: "GSP Beograd",
    stops: [
      { lat: 44.8026, lon: 20.4654, name: "Slavija" },
      { lat: 44.8065, lon: 20.4699, name: "Vukov spomenik" },
    ],
    duration: "5 min",
    frequency: "7-12 min",
    price: "89 RSD",
  },
];

// Функция для расчета времени в пути для разных типов транспорта
export const calculateTransportTimes = (start, end) => {
  if (!start || !end) return {};

  // Расчет расстояния в км
  const distance =
    Math.sqrt(
      Math.pow(end.lat - start.lat, 2) + Math.pow(end.lng - start.lng, 2)
    ) * 111; // приблизительное расстояние в км

  // Расчет времени для каждого типа транспорта (в минутах)
  const times = {
    // Автомобиль (средняя скорость 50 км/ч в городе)
    car: Math.round((distance / 50) * 60),

    // Общественный транспорт (автобус/трамвай - средняя скорость 25 км/ч + ожидание)
    publicTransport: Math.round((distance / 25) * 60) + 5, // +5 мин ожидание

    // Такси (средняя скорость 45 км/ч в городе)
    taxi: Math.round((distance / 45) * 60),

    // Самокат (средняя скорость 15 км/ч)
    scooter: Math.round((distance / 15) * 60),

    // Велосипед (средняя скорость 20 км/ч)
    bike: Math.round((distance / 20) * 60),

    // Пешком (средняя скорость 5 км/ч)
    walking: Math.round((distance / 5) * 60),
  };

  // Найти самый быстрый способ
  const fastestType = Object.entries(times).reduce((a, b) =>
    times[a[0]] < times[b[0]] ? a : b
  );

  return {
    times,
    fastest: {
      type: fastestType[0],
      time: fastestType[1],
      distance: Math.round(distance * 10) / 10, // округляем до 1 знака
    },
  };
};

// Функция для получения ближайших остановок общественного транспорта и такси
export const getNearbyPublicTransport = (start, end) => {
  if (!start || !end) return { stops: [], routes: [], taxis: [] };

  const nearbyStops = PUBLIC_TRANSPORT_STOPS.filter((stop) => {
    const distanceToStart =
      Math.sqrt(
        Math.pow(stop.lat - start.lat, 2) + Math.pow(stop.lon - start.lng, 2)
      ) * 111; // приблизительное расстояние в км

    const distanceToEnd =
      Math.sqrt(
        Math.pow(stop.lat - end.lat, 2) + Math.pow(stop.lon - end.lng, 2)
      ) * 111;

    return distanceToStart < 0.5 || distanceToEnd < 0.5; // в радиусе 500м
  });

  // Найти маршруты, которые проходят через эти остановки (только для автобусов, трамваев, троллейбусов)
  const relevantRoutes = PUBLIC_TRANSPORT_ROUTES.filter((route) => {
    return nearbyStops.some(
      (stop) =>
        stop.type !== "taxi" &&
        stop.routes &&
        stop.routes.includes(route.number)
    );
  });

  // Найти ближайшие такси
  const nearbyTaxis = PUBLIC_TRANSPORT_STOPS.filter(
    (stop) => stop.type === "taxi"
  ).filter((taxi) => {
    const distanceToStart =
      Math.sqrt(
        Math.pow(taxi.lat - start.lat, 2) + Math.pow(taxi.lon - start.lng, 2)
      ) * 111;

    const distanceToEnd =
      Math.sqrt(
        Math.pow(taxi.lat - end.lat, 2) + Math.pow(taxi.lon - end.lng, 2)
      ) * 111;

    return distanceToStart < 1.0 || distanceToEnd < 1.0; // в радиусе 1км для такси
  });

  return {
    stops: nearbyStops,
    routes: relevantRoutes,
    taxis: nearbyTaxis,
  };
};
