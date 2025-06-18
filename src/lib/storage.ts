
// Local storage utilities for data persistence
import { User, Building, Unit, Meter, Reading } from '@/types';

const STORAGE_KEYS = {
  USER: 'meter_app_user',
  BUILDINGS: 'meter_app_buildings',
  UNITS: 'meter_app_units',
  METERS: 'meter_app_meters',
  READINGS: 'meter_app_readings',
};

// User management
export const saveUser = (user: User) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Buildings
export const saveBuildings = (buildings: Building[]) => {
  localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(buildings));
};

export const getBuildings = (): Building[] => {
  const buildings = localStorage.getItem(STORAGE_KEYS.BUILDINGS);
  return buildings ? JSON.parse(buildings) : [];
};

// Units
export const saveUnits = (units: Unit[]) => {
  localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
};

export const getUnits = (): Unit[] => {
  const units = localStorage.getItem(STORAGE_KEYS.UNITS);
  return units ? JSON.parse(units) : [];
};

// Meters
export const saveMeters = (meters: Meter[]) => {
  localStorage.setItem(STORAGE_KEYS.METERS, JSON.stringify(meters));
};

export const getMeters = (): Meter[] => {
  const meters = localStorage.getItem(STORAGE_KEYS.METERS);
  return meters ? JSON.parse(meters) : [];
};

// Readings
export const saveReadings = (readings: Reading[]) => {
  localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(readings));
};

export const getReadings = (): Reading[] => {
  const readings = localStorage.getItem(STORAGE_KEYS.READINGS);
  return readings ? JSON.parse(readings) : [];
};

export const addReading = (reading: Omit<Reading, 'id'>) => {
  const readings = getReadings();
  const newReading = {
    ...reading,
    id: Date.now().toString()
  };
  readings.push(newReading);
  saveReadings(readings);
};

// Clear all localStorage data
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  localStorage.removeItem('sample_data_initialized');
  console.log('Todos os dados locais foram limpos');
};
