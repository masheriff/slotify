// schemas/user.schemas.ts
import { z } from "zod";

// Base schemas - reusable fragments
export const baseUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  organizationId: z.string().uuid("Organization is required"),
});

export const namePartsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
});

export const addressSchema = z.object({
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  code: z.string().optional(),
});

export const contactSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

// Role-specific professional schemas
export const technicianProfessionalSchema = namePartsSchema
  .merge(addressSchema)
  .extend({
    phone: z.string().optional(),
    licenseNumber: z.string().optional(),
    specialty: z.enum([
      "radiology",
      "cardiology",
      "mammography",
      "ultrasound",
      "ct_scan",
      "mri",
      "pet_scan",
      "bone_density",
      "nuclear_medicine",
      "interventional",
      "fluoroscopy",
      "angiography"
    ], { required_error: "Specialty is required for technicians" }),
    certificationLevel: z.enum([
      "entry_level",
      "certified",
      "advanced", 
      "specialist",
      "lead",
      "supervisor"
    ]).default("entry_level"),
    employmentStatus: z.enum([
      "full_time",
      "part_time",
      "contract", 
      "per_diem",
      "temp"
    ]).default("full_time"),
  });

export const interpretingDoctorProfessionalSchema = namePartsSchema
  .merge(addressSchema)
  .extend({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    licenseNumber: z.string().min(1, "Medical license is required for doctors"),
    primarySpecialty: z.enum([
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
    ], { required_error: "Primary specialty is required for doctors" }),
    secondarySpecialty: z.enum([
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
    ]).optional(),
    readingStatus: z.enum([
      "active",
      "inactive",
      "on_leave",
      "restricted",
      "emergency_only"
    ]).default("active"),
    emergencyReads: z.boolean().default(false),
    weekendReads: z.boolean().default(false),
    nightReads: z.boolean().default(false),
  });

// Security/admin fields schema
export const securitySchema = z.object({
  banned: z.boolean().optional(),
  banReason: z.string().optional(),
  banExpires: z.date().optional(),
  emailVerified: z.boolean().optional(),
});

// Role enum
export const userRoleSchema = z.enum([
  "system_admin",
  "five_am_admin", 
  "five_am_agent",
  "client_admin",
  "front_desk",
  "technician",
  "interpreting_doctor"
]);

// Main user schemas using discriminated unions
export const createUserSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("technician"),
    ...baseUserSchema.shape,
    professionalDetails: technicianProfessionalSchema,
    security: securitySchema.optional(),
  }),
  z.object({
    role: z.literal("interpreting_doctor"),
    ...baseUserSchema.shape,
    professionalDetails: interpretingDoctorProfessionalSchema,
    security: securitySchema.optional(),
  }),
  z.object({
    role: z.enum(["system_admin", "five_am_admin", "five_am_agent", "client_admin", "front_desk"]),
    ...baseUserSchema.shape,
    security: securitySchema.optional(),
  })
]);

const partialTechnicianSchema = z.object({
  id: z.string().uuid("User ID is required for updates"),
  role: z.literal("technician"),
  ...baseUserSchema.shape,
  professionalDetails: technicianProfessionalSchema,
  security: securitySchema.optional(),
}).partial().extend({
  role: z.literal("technician"), // ensure role is still required for discrimination
  id: z.string().uuid("User ID is required for updates"), // ensure id is required
});

const partialDoctorSchema = z.object({
  id: z.string().uuid("User ID is required for updates"),
  role: z.literal("interpreting_doctor"),
  ...baseUserSchema.shape,
  professionalDetails: interpretingDoctorProfessionalSchema,
  security: securitySchema.optional(),
}).partial().extend({
  role: z.literal("interpreting_doctor"),
  id: z.string().uuid("User ID is required for updates"),
});

const partialOtherRolesSchema = z.object({
  id: z.string().uuid("User ID is required for updates"),
  role: z.enum(["system_admin", "five_am_admin", "five_am_agent", "client_admin", "front_desk"]),
  ...baseUserSchema.shape,
  security: securitySchema.optional(),
}).partial().extend({
  role: z.enum(["system_admin", "five_am_admin", "five_am_agent", "client_admin", "front_desk"]),
  id: z.string().uuid("User ID is required for updates"),
});

export const updateUserSchema = z.discriminatedUnion("role", [
  partialTechnicianSchema,
  partialDoctorSchema,
  partialOtherRolesSchema,
]);

// Form-specific schemas for better UX
export const userBasicInfoSchema = baseUserSchema.extend({
  role: userRoleSchema,
});

export const userSecurityUpdateSchema = z.object({
  id: z.string().uuid(),
  banned: z.boolean().optional(),
  banReason: z.string().optional(),
  banExpires: z.date().optional(),
  emailVerified: z.boolean().optional(),
});

// Schema for role change validation
export const userRoleChangeSchema = z.object({
  id: z.string().uuid(),
  newRole: userRoleSchema,
  confirmRoleChange: z.boolean().refine(val => val === true, {
    message: "You must confirm the role change"
  }),
});

// Export types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserBasicInfo = z.infer<typeof userBasicInfoSchema>;
export type TechnicianProfessionalDetails = z.infer<typeof technicianProfessionalSchema>;
export type InterpretingDoctorProfessionalDetails = z.infer<typeof interpretingDoctorProfessionalSchema>;
export type UserSecurityUpdate = z.infer<typeof userSecurityUpdateSchema>;
export type UserRoleChange = z.infer<typeof userRoleChangeSchema>;