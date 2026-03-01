export type UserRole = 'RIDER' | 'DRIVER' | 'ADMIN' | 'GUEST';

export enum VehicleType {
  STANDARD = 'Standard',
  SIX_SEATER = '6-Seater',
  EXECUTIVE = 'Executive',
}

export interface RideRequest {
  id: string;
  pickup: string;
  dropoff: string;
  fare: number;
  distance: string;
  status: 'SEARCHING' | 'ACCEPTED' | 'ARRIVED' | 'ON_TRIP' | 'COMPLETED' | 'CANCELLED';
  vehicleType: VehicleType;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  rating?: number;
}

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VehicleDetails {
  type: string;
  make: string;
  model: string;
  year: string;
  color: string;
  plateNumber: string;
  seats: number;
}

export interface DriverDocuments {
  vehicleRegistration: string | null; // ZINARA Registration Book
  vehicleInsurance: string | null;     // Valid Insurance Disk
  driverLicense: string | null;        // VID Driver's License
  nationalId: string | null;           // Zimbabwean National ID
}

export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relation: string;
}

export interface AssignedDriverInfo {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  verificationStatus: VerificationStatus;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  emailVerified: boolean;
  
  // Independent Verification Statuses
  riderVerificationStatus: VerificationStatus;
  driverVerificationStatus: VerificationStatus;

  // Identity Verification (General/Rider)
  idType: string;
  idNumber: string;
  idImageFront: string | null;
  idImageBack: string | null;
  selfieImage: string | null;
  idVerified: boolean;
  rejectionReason?: string;

  // Payment Preferences
  preferredPaymentType: 'CASH' | 'WALLET' | 'CARD';
  selectedWalletName?: string;
  selectedCardLast4?: string;

  // Emergency Contacts
  emergencyContacts: EmergencyContact[];

  // Driver / Owner Specifics
  isVehicleOwner?: boolean; 
  isOwnerDriven?: boolean;
  assignedDriver?: AssignedDriverInfo;
  
  driverDetails?: {
    vehicle: VehicleDetails;
    documents: DriverDocuments;
    holdingIdSelfie: string | null;
  };
  
  // Financial
  walletBalance: number;
  payoutMethod: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}