export const SOIL_METRIC_CONFIG = {
  moisture: {
    label: "Soil Moisture",
    unit: "%",
    min: 0,
    max: 100,
    color: "#8884d8",
  },
  humidity: {
    label: "Air Humidity",
    unit: "%",
    min: 0,
    max: 100,
    color: "#82ca9d",
  },
  temperature: {
    label: "Temperature",
    unit: "°C",
    min: 0,
    max: 100,
    color: "#ffc658",
  },
  light: {
    label: "Light Intensity",
    unit: "lux",
    min: 1200,
    max: 120000,
    color: "#ff7300",
  },
} as const;

export type SoilMetricKey = keyof typeof SOIL_METRIC_CONFIG;

export const SOIL_RTDB_PATHS = {
  current: "soil/current",
  history: "soil/history",
} as const;

