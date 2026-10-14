export interface Appointment {
  id: number;
  customer: string;
  phone: string;
  time: string; // HH:mm
  date: string; // YYYY-MM-DD
  serviceId: number;
  staffId: number;
  status: 'bekliyor' | 'tamamlandi' | 'iptal';
  note?: string;
  createdAt: string;
  reminderStatus?: 'pending' | 'sent' | 'skipped';
}

export interface Service {
  id: number;
  name: string;
  price: number;
  duration: number; // minutes
  category?: string;
}

export interface Staff {
  id: number;
  name: string;
  photo: string;
  role: string;
  phone?: string;
  workingHours?: string;
  commissionRate: number; // e.g. 50 for 50%
  notes?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  notes?: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  type: 'gelir' | 'gider';
  title: string;
  customer?: string;
  amount: number;
  time: string; // HH:mm
  date: string; // YYYY-MM-DD
  staffId?: number;
  serviceId?: number;
  category?: string;
  staffShare?: number; // Barber's commission share
  salonShare?: number; // Salon's net share
}

export interface SalonSettings {
  salonName: string;
  tagline: string;
  phone: string;
  address: string; // Google Maps Link
  whatsappGreeting: string;
  whatsappConnected?: boolean;
  whatsappPhone?: string;
  whatsappBusinessName?: string;
}

export interface GoogleUser {
  isLoggedIn: boolean;
  name: string;
  email: string;
  photo: string;
  isDriveConnected?: boolean;
  lastDriveBackup?: string;
}

export interface DriveAccount {
  isConnected: boolean;
  name: string;
  email: string;
  photo: string;
  accessToken?: string;
  lastBackup?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}
