// lib/utils/user-form-helpers.ts - Helper functions and schemas for user form

import { z } from "zod";
import { UserRole } from "@/types/user.types";

// Helper function to check if role requires professional details
export function requiresProfessionalDetails(role: string): boolean {
  return role === "technician" || role === "interpreting_doctor";
}

// Helper function to get available roles for system admin
export function getAvailableRoles(currentUserRole: string, organizationType: string) {
  if (currentUserRole === "system_admin") {
    return [
      { value: "system_admin", label: "System Administrator", disabled: false },
      { value: "five_am_admin", label: "5AM Admin", disabled: false },
      { value: "five_am_agent", label: "5AM Agent", disabled: false },
      { value: "client_admin", label: "Client Administrator", disabled: false },
      { value: "front_desk", label: "Front Desk", disabled: false },
      { value: "technician", label: "Technician", disabled: false },
      { value: "interpreting_doctor", label: "Interpreting Doctor", disabled: false },
    ];
  }
  
  // Add other role logic here based on your permissions
  return [];
}

export function getRoleDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    "system_admin": "System Administrator",
    "five_am_admin": "5AM Admin", 
    "five_am_agent": "5AM Agent",
    "client_admin": "Client Administrator",
    "front_desk": "Front Desk",
    "technician": "Technician",
    "interpreting_doctor": "Interpreting Doctor",
  };
  
  return roleMap[role] || role;
}

// Transform form data to match your server action expectations
export function transformUserFormData(formData: any) {
  const { role, professionalDetails, ...baseData } = formData;
  
  // For non-professional roles, just return base data
  if (!requiresProfessionalDetails(role)) {
    return {
      ...baseData,
      role,
    };
  }
  
  // For professional roles, include professional details
  return {
    ...baseData,
    role,
    professionalDetails,
  };
}

// Validation helpers
export const specialtyOptions = {
  technician: [
    { value: "radiology", label: "Radiology" },
    { value: "cardiology", label: "Cardiology" },
    { value: "mammography", label: "Mammography" },
    { value: "ultrasound", label: "Ultrasound" },
    { value: "ct_scan", label: "CT Scan" },
    { value: "mri", label: "MRI" },
    { value: "pet_scan", label: "PET Scan" },
    { value: "bone_density", label: "Bone Density" },
    { value: "nuclear_medicine", label: "Nuclear Medicine" },
    { value: "interventional", label: "Interventional" },
    { value: "fluoroscopy", label: "Fluoroscopy" },
    { value: "angiography", label: "Angiography" },
  ],
  interpretingDoctor: [
    { value: "radiology", label: "Radiology" },
    { value: "cardiology", label: "Cardiology" },
    { value: "pathology", label: "Pathology" },
    { value: "nuclear_medicine", label: "Nuclear Medicine" },
    { value: "mammography", label: "Mammography" },
    { value: "ultrasound", label: "Ultrasound" },
    { value: "ct_scan", label: "CT Scan" },
    { value: "mri", label: "MRI" },
    { value: "pet_scan", label: "PET Scan" },
    { value: "bone_density", label: "Bone Density" },
    { value: "interventional_radiology", label: "Interventional Radiology" },
    { value: "neuroradiology", label: "Neuroradiology" },
    { value: "pediatric_radiology", label: "Pediatric Radiology" },
    { value: "musculoskeletal_radiology", label: "Musculoskeletal Radiology" },
    { value: "abdominal_radiology", label: "Abdominal Radiology" },
    { value: "thoracic_radiology", label: "Thoracic Radiology" },
    { value: "emergency_radiology", label: "Emergency Radiology" },
    { value: "echocardiography", label: "Echocardiography" },
    { value: "stress_testing", label: "Stress Testing" },
    { value: "holter_monitoring", label: "Holter Monitoring" },
    { value: "ekg_interpretation", label: "EKG Interpretation" },
  ],
};

export const certificationLevelOptions = [
  { value: "entry_level", label: "Entry Level" },
  { value: "certified", label: "Certified" },
  { value: "advanced", label: "Advanced" },
  { value: "specialist", label: "Specialist" },
  { value: "lead", label: "Lead" },
  { value: "supervisor", label: "Supervisor" },
];

export const employmentStatusOptions = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "per_diem", label: "Per Diem" },
  { value: "temp", label: "Temporary" },
];

export const readingStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "on_leave", label: "On Leave" },
  { value: "restricted", label: "Restricted" },
  { value: "emergency_only", label: "Emergency Only" },
];