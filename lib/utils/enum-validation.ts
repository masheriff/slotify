// lib/utils/enum-validation.ts - Better Type Safety for Enums

// Technician enum values (should match your schema)
export const FACILITY_SPECIALTIES = [
  "mammography",
  "ultrasound", 
  "ct_scan",
  "mri",
  "pet_scan",
  "bone_density",
  "nuclear_medicine",
  "stress_testing",
  "holter_monitoring",
  "x_ray",
  "dexa_scan",
  "echo_cardiogram",
  "electrocardiogram",
  "pulmonary_function",
  "sleep_study",
  "cardiac_catheterization",
  "angiography",
  "endoscopy",
  "colonoscopy",
  "bronchoscopy",
  "arthroscopy",
  "laparoscopy",
  "radiation_therapy"
] as const;

export const CERTIFICATION_LEVELS = [
  "entry_level",
  "certified", 
  "advanced",
  "specialist",
  "lead",
  "supervisor"
] as const;

export const EMPLOYMENT_STATUSES = [
  "full_time",
  "part_time", 
  "contract",
  "per_diem",
  "temp"
] as const;

// Interpreting Doctor enum values
export const INTERPRETING_SPECIALTIES = [
  "radiology",
  "cardiology", 
  "pathology",
  "nuclear_medicine",
  "mammography",
  "ultrasound",
  "ct_scan",
  "mri",
  "pet_scan",
  "bone_density",
  "interventional_radiology",
  "neuroradiology",
  "pediatric_radiology",
  "musculoskeletal_radiology",
  "abdominal_radiology",
  "thoracic_radiology",
  "emergency_radiology",
  "echocardiography",
  "stress_testing",
  "holter_monitoring",
  "ekg_interpretation"
] as const;

export const READING_STATUSES = [
  "active",
  "inactive",
  "on_leave",
  "restricted",
  "emergency_only"
] as const;

// Type definitions
export type FacilitySpecialty = typeof FACILITY_SPECIALTIES[number];
export type CertificationLevel = typeof CERTIFICATION_LEVELS[number];
export type EmploymentStatus = typeof EMPLOYMENT_STATUSES[number];
export type InterpretingSpecialty = typeof INTERPRETING_SPECIALTIES[number];
export type ReadingStatus = typeof READING_STATUSES[number];

// Validation functions
export function isValidFacilitySpecialty(value: string): value is FacilitySpecialty {
  return FACILITY_SPECIALTIES.includes(value as FacilitySpecialty);
}

export function isValidCertificationLevel(value: string): value is CertificationLevel {
  return CERTIFICATION_LEVELS.includes(value as CertificationLevel);
}

export function isValidEmploymentStatus(value: string): value is EmploymentStatus {
  return EMPLOYMENT_STATUSES.includes(value as EmploymentStatus);
}

export function isValidInterpretingSpecialty(value: string): value is InterpretingSpecialty {
  return INTERPRETING_SPECIALTIES.includes(value as InterpretingSpecialty);
}

export function isValidReadingStatus(value: string): value is ReadingStatus {
  return READING_STATUSES.includes(value as ReadingStatus);
}

// Enhanced validation with error messages
export function validateTechnicianEnums(data: {
  specialty?: string;
  certificationLevel?: string;
  employmentStatus?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.specialty && !isValidFacilitySpecialty(data.specialty)) {
    errors.push(`Invalid specialty: ${data.specialty}. Must be one of: ${FACILITY_SPECIALTIES.join(", ")}`);
  }

  if (data.certificationLevel && !isValidCertificationLevel(data.certificationLevel)) {
    errors.push(`Invalid certification level: ${data.certificationLevel}. Must be one of: ${CERTIFICATION_LEVELS.join(", ")}`);
  }

  if (data.employmentStatus && !isValidEmploymentStatus(data.employmentStatus)) {
    errors.push(`Invalid employment status: ${data.employmentStatus}. Must be one of: ${EMPLOYMENT_STATUSES.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateInterpretingDoctorEnums(data: {
  primarySpecialty?: string;
  secondarySpecialty?: string;
  readingStatus?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.primarySpecialty && !isValidInterpretingSpecialty(data.primarySpecialty)) {
    errors.push(`Invalid primary specialty: ${data.primarySpecialty}. Must be one of: ${INTERPRETING_SPECIALTIES.join(", ")}`);
  }

  if (data.secondarySpecialty && !isValidInterpretingSpecialty(data.secondarySpecialty)) {
    errors.push(`Invalid secondary specialty: ${data.secondarySpecialty}. Must be one of: ${INTERPRETING_SPECIALTIES.join(", ")}`);
  }

  if (data.readingStatus && !isValidReadingStatus(data.readingStatus)) {
    errors.push(`Invalid reading status: ${data.readingStatus}. Must be one of: ${READING_STATUSES.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}