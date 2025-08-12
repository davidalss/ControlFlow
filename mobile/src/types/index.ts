// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'inspector' | 'engineering' | 'supervisor';
  businessUnit: string;
  avatar?: string;
}

// Product Types
export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  businessUnit: string;
  family: string;
  category: string;
  specifications: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Inspection Plan Types
export interface InspectionPlan {
  id: string;
  name: string;
  description: string;
  productId: string;
  businessUnit: string;
  parameters: InspectionParameter[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'on-demand';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionParameter {
  id: string;
  name: string;
  type: 'numeric' | 'text' | 'boolean' | 'select' | 'file';
  unit?: string;
  target?: number;
  tolerance?: number;
  minValue?: number;
  maxValue?: number;
  options?: string[];
  required: boolean;
  description?: string;
}

// Inspection Types
export interface Inspection {
  id: string;
  productId: string;
  inspectionPlanId: string;
  inspectorId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected' | 'approved';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  results: InspectionResult[];
  photos: string[];
  videos: string[];
  notes?: string;
  startedAt: string;
  completedAt?: string;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionResult {
  parameterId: string;
  parameterName: string;
  value: any;
  unit?: string;
  isConforming: boolean;
  notes?: string;
}

// Offline Data Types
export interface OfflineData {
  inspections: Inspection[];
  products: Product[];
  inspectionPlans: InspectionPlan[];
  pendingSync: {
    inspections: string[];
    photos: string[];
    videos: string[];
  };
}

// Camera Types
export interface PhotoData {
  uri: string;
  width: number;
  height: number;
  type: 'image/jpeg' | 'image/png';
  size: number;
  timestamp: string;
}

export interface VideoData {
  uri: string;
  duration: number;
  size: number;
  timestamp: string;
}

// Barcode Types
export interface BarcodeData {
  type: 'qr' | 'code128' | 'code39' | 'ean13' | 'ean8';
  data: string;
  timestamp: string;
}

// Sync Types
export interface SyncStatus {
  isOnline: boolean;
  lastSync: string;
  pendingItems: number;
  syncInProgress: boolean;
  error?: string;
}

// Settings Types
export interface AppSettings {
  serverUrl: string;
  syncInterval: number;
  photoQuality: 'low' | 'medium' | 'high';
  videoQuality: 'low' | 'medium' | 'high';
  autoSync: boolean;
  locationEnabled: boolean;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'pt-BR' | 'en-US' | 'es-ES';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Form Types
export interface InspectionFormData {
  productId: string;
  inspectionPlanId: string;
  results: Record<string, any>;
  photos: string[];
  videos: string[];
  notes?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}
