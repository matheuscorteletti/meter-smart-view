
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  buildingId?: string;
  unitId?: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  createdAt: string;
}

export interface Unit {
  id: string;
  buildingId: string;
  number: string;
  floor: string;
  buildingName?: string;
}

export interface Meter {
  id: string;
  unitId: string;
  type: 'water' | 'energy';
  totalDigits: number;
  calculationDigits: number;
  initialReading: number;
  threshold: number;
  unitNumber?: string;
  buildingName?: string;
  isActive?: boolean;
}

export interface Reading {
  id: string;
  meterId: string;
  reading: number;
  consumption: number;
  date: string;
  isAlert: boolean;
  meterType?: string;
  unitNumber?: string;
  launchedBy?: string;
}
