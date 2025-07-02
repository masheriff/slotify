import z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const memberFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.string().min(1, "Please select a role"),
  name: z.string().optional(),
});

export type MemberFormData = z.infer<typeof memberFormSchema>;


export const organizationFormSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  logo: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      return val.startsWith("/") || val.startsWith("http");
    }, "Logo must be a valid URL or path"),

  // FIXED: Allow both admin and client types for edit mode
  type: z.enum(["admin", "client"]),

  // Contact Information
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),

  // Address Information
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  timezone: z.string().min(1, "Timezone is required"),

  // HIPAA Compliance
  hipaaOfficer: z.string().min(1, "HIPAA Officer is required"),
  businessAssociateAgreement: z
    .boolean()
    .refine(
      (val) => val === true,
      "Business Associate Agreement must be signed"
    ),
  dataRetentionYears: z.string().min(1, "Data retention period is required"),
  // Status field - only for edit mode
  isActive: z.boolean(),
});

export type OrganizationFormData = z.infer<typeof organizationFormSchema>;
