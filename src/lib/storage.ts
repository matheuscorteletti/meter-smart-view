
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

// Generate sample data for demonstration
export const initializeSampleData = () => {
  if (localStorage.getItem('sample_data_initialized')) return;

  const buildings: Building[] = [
    {
      id: 'building-1',
      name: 'Edifício Central',
      address: 'Rua das Flores, 123',
      createdAt: new Date().toISOString(),
    },
  ];

  const units: Unit[] = [
    {
      id: 'unit-1',
      buildingId: 'building-1',
      number: '101',
      floor: '1',
    },
    {
      id: 'unit-2',
      buildingId: 'building-1',
      number: '102',
      floor: '1',
    },
  ];

  const meters: Meter[] = [
    {
      id: 'meter-1',
      unitId: 'unit-1',
      type: 'water',
      totalDigits: 8,
      calculationDigits: 5,
      initialReading: 12345,
      threshold: 50,
    },
    {
      id: 'meter-2',
      unitId: 'unit-1',
      type: 'energy',
      totalDigits: 6,
      calculationDigits: 4,
      initialReading: 5678,
      threshold: 300,
    },
  ];

  const readings: Reading[] = [
    {
      id: 'reading-1',
      meterId: 'meter-1',
      reading: 12367,
      consumption: 22,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isAlert: false,
    },
    {
      id: 'reading-2',
      meterId: 'meter-2',
      reading: 5998,
      consumption: 320,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isAlert: true,
    },
  ];

  saveBuildings(buildings);
  saveUnits(units);
  saveMeters(meters);
  saveReadings(readings);
  localStorage.setItem('sample_data_initialized', 'true');
};
