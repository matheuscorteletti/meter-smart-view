
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  buildingId?: string;
  unitId?: string;
  active?: boolean;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  contactEmail?: string;
  contactPhone?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Unit {
  id: string;
  buildingId: string;
  number: string;
  floor: string;
  ownerName?: string;
  ownerEmail?: string;
  buildingName?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  unitNumber?: string;
  buildingName?: string;
  active?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reading {
  id: string;
  meterId: string;
  reading: number;
  consumption: number;
  readingDate?: string;
  date?: string; // compatibilidade
  readerId?: string;
  notes?: string;
  isAlert?: boolean;
  alertReason?: string;
  meterType?: string;
  unitNumber?: string;
  launchedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeterWithDetails extends Meter {
  buildingId: string;
}

export interface ReadingWithMeter extends Reading {
  meter: Meter;
}

export interface Alert {
  id: string;
  type: 'high_consumption' | 'meter_error' | 'missing_reading';
  message: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
  meterId?: string;
  readingId?: string;
  acknowledged: boolean;
}
