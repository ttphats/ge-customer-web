// Customer Types
export interface Customer {
  id: number;
  fullname: string;
  dateofbirth: Date | string;
  phoneNumber: string;
  address?: string;
  gender?: number; // 0: Nam, 1: Nữ
  createdDate: Date | string;
  familyKey?: string;
  prescriptions?: Prescription[];
  familyMembers?: FamilyMember[];
}

export interface CustomerFormData {
  fullname: string;
  dateofbirth: string;
  phoneNumber: string;
  address?: string;
  gender?: number;
}

// Prescription Types
export interface Prescription {
  id: number;
  examinedDate: Date | string;
  
  // Left eye
  leftSphere?: string;
  leftCylinder?: string;
  leftAxis?: number;
  leftLk?: string;
  leftAddition?: string;
  leftTl?: string;
  leftPd?: string;
  
  // Right eye
  rightSphere?: string;
  rightCylinder?: string;
  rightAxis?: number;
  rightLk?: string;
  rightAddition?: string;
  rightTl?: string;
  rightPd?: string;
  
  description?: string;
  staffName?: string;
  customerId?: number;
  refKey: string;
  
  // Frame & Lens
  frameName?: string;
  framePrice?: string;
  lenseName?: string;
  lensePrice?: string;
  
  reExaminatedDate?: Date | string;
  
  customer?: Customer;
}

export interface MachinePrescription {
  id: number;
  examinedDate: Date | string;
  
  leftSphere?: string;
  leftCylinder?: string;
  leftAxis?: number;
  leftLk?: string;
  leftAddition?: string;
  leftTl?: string;
  leftPd?: string;
  
  rightSphere?: string;
  rightCylinder?: string;
  rightAxis?: number;
  rightLk?: string;
  rightAddition?: string;
  rightTl?: string;
  rightPd?: string;
  
  description?: string;
  staffName?: string;
  customerId?: number;
  refKey?: string;
}

export interface OldPrescription {
  id: number;
  examinedDate: Date | string;
  
  leftSphere?: string;
  leftCylinder?: string;
  leftAxis?: number;
  leftLk?: string;
  leftAddition?: string;
  leftTl?: string;
  leftPd?: string;
  
  rightSphere?: string;
  rightCylinder?: string;
  rightAxis?: number;
  rightLk?: string;
  rightAddition?: string;
  rightTl?: string;
  rightPd?: string;
  
  description?: string;
  staffName?: string;
  customerId?: number;
  refKey?: string;
}

// Family Member Types
export interface FamilyMember {
  id: number;
  fullname: string;
  dateofbirth?: Date | string;
  phoneNumber?: string;
  address?: string;
  gender?: number;
  role?: string;
  customerId: number;
  customer?: Customer;
}

// User Types
export interface User {
  id: number;
  username: string;
  password?: string;
  role?: string;
  status: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Search/Filter Types
export interface CustomerSearchParams {
  fullname?: string;
  phoneNumber?: string;
  page?: number;
  pageSize?: number;
}

// Full Prescription Data (includes all 3 types)
export interface FullPrescriptionData {
  prescription: Prescription;
  oldPrescription?: OldPrescription;
  machinePrescription?: MachinePrescription;
}

