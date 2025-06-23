// types/healthcare.types.ts
export interface Patient {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phone?: string;
  email?: string;
  address: PatientAddress;
  emergencyContact?: EmergencyContact;
  insuranceInfo?: InsuranceInfo;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface PatientAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  memberName?: string;
  effectiveDate?: Date;
  expirationDate?: Date;
}

export interface Appointment {
  id: string;
  organizationId: string;
  patientId: string;
  procedureType: string;
  scheduledAt: Date;
  duration: number; // in minutes
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export type AppointmentStatus = 
  | "scheduled" 
  | "confirmed" 
  | "in_progress" 
  | "completed" 
  | "cancelled" 
  | "no_show";

export interface Booking {
  id: string;
  organizationId: string;
  appointmentId?: string;
  patientId: string;
  procedureLocationId: string;
  assignedTechnicianId?: string;
  procedureType: string;
  scheduledAt: Date;
  checkInAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: BookingStatus;
  notes?: string;
  deviceAssignments?: DeviceAssignment[];
  interpretationAssignment?: InterpretationAssignment;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export type BookingStatus = 
  | "scheduled" 
  | "checked_in" 
  | "in_progress" 
  | "completed" 
  | "cancelled" 
  | "interpretation_pending" 
  | "interpretation_completed";

export interface DeviceAssignment {
  deviceId: string;
  assignedAt: Date;
  returnedAt?: Date;
  condition: "good" | "fair" | "needs_maintenance";
  notes?: string;
}

export interface InterpretationAssignment {
  interpretingDoctorId: string;
  assignedAt: Date;
  completedAt?: Date;
  status: "assigned" | "in_progress" | "completed";
  priority: "low" | "normal" | "high" | "urgent";
  notes?: string;
}
