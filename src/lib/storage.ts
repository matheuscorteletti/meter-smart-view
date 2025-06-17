
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
  // Limpar dados existentes e forçar reinicialização
  localStorage.removeItem('sample_data_initialized');
  
  const buildings: Building[] = [
    {
      id: 'building-1013',
      name: 'Prédio 1013',
      address: 'Av Joana Angélica 1013',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'building-1412',
      name: 'Prédio 1412',
      address: 'Av Joana Angélica 1412',
      createdAt: new Date().toISOString(),
    },
  ];

  const units: Unit[] = [
    // Unidades do Prédio 1013
    {
      id: 'unit-1013-externo',
      buildingId: 'building-1013',
      number: 'Externo',
      floor: 'Térreo',
    },
    {
      id: 'unit-1013-cond-serv',
      buildingId: 'building-1013',
      number: 'COND SERV',
      floor: 'Térreo',
    },
    // Unidades do Prédio 1412
    {
      id: 'unit-1412-externo',
      buildingId: 'building-1412',
      number: 'Externo',
      floor: 'Térreo',
    },
    {
      id: 'unit-1412-ap001',
      buildingId: 'building-1412',
      number: 'AP 001',
      floor: 'Térreo',
    },
    {
      id: 'unit-1412-ap101',
      buildingId: 'building-1412',
      number: 'AP 101',
      floor: '1',
    },
    {
      id: 'unit-1412-ap011',
      buildingId: 'building-1412',
      number: 'AP 011',
      floor: 'Térreo',
    },
    {
      id: 'unit-1412-ap012',
      buildingId: 'building-1412',
      number: 'AP 012',
      floor: 'Térreo',
    },
  ];

  const meters: Meter[] = [
    // Medidores do Prédio 1013
    {
      id: 'meter-1013-hidro-externo',
      unitId: 'unit-1013-externo',
      type: 'water',
      totalDigits: 8,
      calculationDigits: 5,
      initialReading: 12000,
      threshold: 50,
    },
    {
      id: 'meter-1013-energia-cond',
      unitId: 'unit-1013-cond-serv',
      type: 'energy',
      totalDigits: 6,
      calculationDigits: 4,
      initialReading: 5500,
      threshold: 300,
    },
    // Medidores do Prédio 1412
    {
      id: 'meter-1412-hidro-externo',
      unitId: 'unit-1412-externo',
      type: 'water',
      totalDigits: 8,
      calculationDigits: 5,
      initialReading: 15000,
      threshold: 50,
    },
    {
      id: 'meter-1412-hidro-ap001',
      unitId: 'unit-1412-ap001',
      type: 'water',
      totalDigits: 8,
      calculationDigits: 5,
      initialReading: 8500,
      threshold: 30,
    },
    {
      id: 'meter-1412-hidro-ap101',
      unitId: 'unit-1412-ap101',
      type: 'water',
      totalDigits: 8,
      calculationDigits: 5,
      initialReading: 9200,
      threshold: 30,
    },
    {
      id: 'meter-1412-hidro-ap011',
      unitId: 'unit-1412-ap011',
      type: 'water',
      totalDigits: 8,
      calculationDigits: 5,
      initialReading: 7800,
      threshold: 30,
    },
    {
      id: 'meter-1412-hidro-ap012',
      unitId: 'unit-1412-ap012',
      type: 'water',
      totalDigits: 8,
      calculationDigits: 5,
      initialReading: 8100,
      threshold: 30,
    },
  ];

  const readings: Reading[] = [
    // Algumas leituras de exemplo para o Prédio 1013
    {
      id: 'reading-1013-hidro-1',
      meterId: 'meter-1013-hidro-externo',
      reading: 12025,
      consumption: 25,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isAlert: false,
    },
    {
      id: 'reading-1013-energia-1',
      meterId: 'meter-1013-energia-cond',
      reading: 5820,
      consumption: 320,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isAlert: true,
    },
    // Algumas leituras de exemplo para o Prédio 1412
    {
      id: 'reading-1412-externo-1',
      meterId: 'meter-1412-hidro-externo',
      reading: 15040,
      consumption: 40,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      isAlert: false,
    },
    {
      id: 'reading-1412-ap001-1',
      meterId: 'meter-1412-hidro-ap001',
      reading: 8518,
      consumption: 18,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isAlert: false,
    },
  ];

  saveBuildings(buildings);
  saveUnits(units);
  saveMeters(meters);
  saveReadings(readings);
  localStorage.setItem('sample_data_initialized', 'true');
  
  console.log('Dados de exemplo inicializados:', { buildings, units, meters, readings });
};
