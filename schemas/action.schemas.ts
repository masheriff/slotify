import z from "zod";

export const organizationDataSchema = z.object({
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

  metadata: z.object({
    type: z.enum(["admin", "client"]),
    // FIXED: Match form validation requirements exactly
    contactEmail: z.string().email("Please enter a valid email address"),
    contactPhone: z.string().min(10, "Please enter a valid phone number"),
    addressLine1: z.string().min(1, "Address line 1 is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State/Province is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
    timezone: z.string().min(1, "Timezone is required"),
    // FIXED: Match form requirements exactly
    hipaaOfficer: z.string().min(1, "HIPAA Officer is required"),
    businessAssociateAgreement: z
      .boolean()
      .refine(
        (val) => val === true,
        "Business Associate Agreement must be signed"
      ),
    dataRetentionYears: z.string().min(1, "Data retention period is required"),
    isActive: z.boolean().default(true),
    settings: z
      .object({
        features: z
          .object({
            multiTenant: z.boolean().optional(),
            advancedReporting: z.boolean().optional(),
            apiAccess: z.boolean().optional(),
            customBranding: z.boolean().optional(),
          })
          .optional(),
        billing: z
          .object({
            plan: z.string().optional(),
            status: z.string().optional(),
          })
          .optional(),
        notifications: z
          .object({
            email: z.boolean().optional(),
            sms: z.boolean().optional(),
          })
          .optional(),
      })
      .optional(),
  }),
  createdAt: z.string().optional(),
});

export type OrganizationInput = z.infer<typeof organizationDataSchema>;

export const MagicLinkSignInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  recaptchaToken: z.string().min(1, "reCAPTCHA token is required"),
});

export type MagicLinkSignInInput = z.infer<typeof MagicLinkSignInSchema>;
