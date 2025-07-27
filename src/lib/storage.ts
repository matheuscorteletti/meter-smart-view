// Este arquivo substitui as funções do localStorage por hooks do Supabase
// As funções ainda retornam dados mock até que todos os componentes sejam migrados

export interface Building {
  id: string;
  name: string;
  address: string;
  contactEmail?: string;
  contactPhone?: string;
  active?: boolean;
}

export interface Unit {
  id: string;
  buildingId: string;
  number: string;
  floor: string;
  ownerName?: string;
  ownerEmail?: string;
  active?: boolean;
}

export interface Meter {
  id: string;
  unitId: string;
  serialNumber?: string;
  type: 'agua' | 'energia' | 'gas';
  brand?: string;
  model?: string;
  installationDate?: string;
  multiplier?: number;
  threshold: number;
  totalDigits: number;
  calculationDigits: number;
  initialReading: number;
  active?: boolean;
}

export interface Reading {
  id: string;
  meterId: string;
  readingDate?: string;
  reading: number;
  consumption: number;
  readerId?: string;
  notes?: string;
  isAlert?: boolean;
  alertReason?: string;
  meterType?: string;
  unitNumber?: string;
  launchedBy?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  buildingId?: string;
  unitId?: string;
  active?: boolean;
}

// Mock data para compatibilidade temporária
const mockBuildings: Building[] = [];
const mockUnits: Unit[] = [];
const mockMeters: Meter[] = [];
const mockReadings: Reading[] = [];
const mockUsers: User[] = [];

// Funções temporárias para compatibilidade
export const initializeSampleData = () => {
  console.log('Sample data initialization deprecated - using Supabase');
};

export const getBuildings = (): Building[] => mockBuildings;
export const saveBuildings = (buildings: Building[]) => {
  console.log('saveBuildings deprecated - use Supabase hooks');
};
export const addBuilding = (building: Building) => {
  console.log('addBuilding deprecated - use Supabase hooks');
};
export const updateBuilding = (building: Building) => {
  console.log('updateBuilding deprecated - use Supabase hooks');
};
export const deleteBuilding = (id: string) => {
  console.log('deleteBuilding deprecated - use Supabase hooks');
};

export const getUnits = (): Unit[] => mockUnits;
export const saveUnits = (units: Unit[]) => {
  console.log('saveUnits deprecated - use Supabase hooks');
};
export const addUnit = (unit: Unit) => {
  console.log('addUnit deprecated - use Supabase hooks');
};
export const updateUnit = (unit: Unit) => {
  console.log('updateUnit deprecated - use Supabase hooks');
};
export const deleteUnit = (id: string) => {
  console.log('deleteUnit deprecated - use Supabase hooks');
};

export const getMeters = (): Meter[] => mockMeters;
export const saveMeters = (meters: Meter[]) => {
  console.log('saveMeters deprecated - use Supabase hooks');
};
export const addMeter = (meter: Meter) => {
  console.log('addMeter deprecated - use Supabase hooks');
};
export const updateMeter = (meter: Meter) => {
  console.log('updateMeter deprecated - use Supabase hooks');
};
export const deleteMeter = (id: string) => {
  console.log('deleteMeter deprecated - use Supabase hooks');
};

export const getReadings = (): Reading[] => mockReadings;
export const saveReadings = (readings: Reading[]) => {
  console.log('saveReadings deprecated - use Supabase hooks');
};
export const addReading = (reading: Reading) => {
  console.log('addReading deprecated - use Supabase hooks');
};
export const updateReading = (reading: Reading) => {
  console.log('updateReading deprecated - use Supabase hooks');
};
export const deleteReading = (id: string) => {
  console.log('deleteReading deprecated - use Supabase hooks');
};

export const getUsers = (): User[] => mockUsers;
export const saveUsers = (users: User[]) => {
  console.log('saveUsers deprecated - use Supabase hooks');
};
export const addUser = (user: User) => {
  console.log('addUser deprecated - use Supabase hooks');
};
export const updateUser = (user: User) => {
  console.log('updateUser deprecated - use Supabase hooks');
};
export const deleteUser = (id: string) => {
  console.log('deleteUser deprecated - use Supabase hooks');
};

export const exportData = () => {
  console.log('exportData deprecated - use Supabase');
  return '';
};

export const importData = (jsonData: string) => {
  console.log('importData deprecated - use Supabase');
};

export const getUser = (): User | null => null;
export const saveUser = (user: User) => {
  console.log('saveUser deprecated - using Supabase auth');
};
export const removeUser = () => {
  console.log('removeUser deprecated - using Supabase auth');
};