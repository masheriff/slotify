// components/admin/forms/user-form.tsx - CORRECT VERSION
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, User, Shield, Briefcase } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { UserFormProps, UserRole } from "@/types/user.types";
import { createUser, updateUser, getUserById } from "@/actions/user-actions";
import { getAvailableRoles, getRoleDisplayName, requiresProfessionalDetails } from "@/lib/utils/user-utils";
import { getErrorMessage } from "@/types";
import { z } from "zod";

// Define proper form schema that matches the discriminated union structure
const baseUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  organizationId: z.string().optional(),
  security: z.object({
    banned: z.boolean().optional(),
    banReason: z.string().optional(),
    emailVerified: z.boolean().optional(),
  }).optional(),
});

// Technician specific schema
const technicianUserSchema = baseUserSchema.extend({
  role: z.literal("technician"),
  professionalDetails: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    middleName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    code: z.string().optional(),
    licenseNumber: z.string().optional(),
    specialty: z.enum([
      "radiology", "cardiology", "mammography", "ultrasound", "ct_scan", "mri",
      "pet_scan", "bone_density", "nuclear_medicine", "interventional", "fluoroscopy", "angiography"
    ]),
    certificationLevel: z.enum(["entry_level", "certified", "advanced", "specialist", "lead", "supervisor"]).optional(),
    employmentStatus: z.enum(["full_time", "part_time", "contract", "per_diem", "temp"]).optional(),
  }),
});

// Interpreting Doctor specific schema
const interpretingDoctorUserSchema = baseUserSchema.extend({
  role: z.literal("interpreting_doctor"),
  professionalDetails: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    middleName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    code: z.string().optional(),
    licenseNumber: z.string().min(1, "License number is required"),
    primarySpecialty: z.enum([
      "radiology", "cardiology", "pathology", "nuclear_medicine", "mammography",
      "ultrasound", "ct_scan", "mri", "pet_scan", "bone_density",
      "interventional_radiology", "neuroradiology", "pediatric_radiology",
      "musculoskeletal_radiology", "abdominal_radiology", "thoracic_radiology",
      "emergency_radiology", "echocardiography", "stress_testing",
      "holter_monitoring", "ekg_interpretation"
    ]),
    secondarySpecialty: z.enum([
      "radiology", "cardiology", "pathology", "nuclear_medicine", "mammography",
      "ultrasound", "ct_scan", "mri", "pet_scan", "bone_density",
      "interventional_radiology", "neuroradiology", "pediatric_radiology",
      "musculoskeletal_radiology", "abdominal_radiology", "thoracic_radiology",
      "emergency_radiology", "echocardiography", "stress_testing",
      "holter_monitoring", "ekg_interpretation"
    ]).optional(),
    readingStatus: z.enum(["active", "inactive", "on_leave", "restricted", "emergency_only"]).optional(),
    emergencyReads: z.boolean().optional(),
    weekendReads: z.boolean().optional(),
    nightReads: z.boolean().optional(),
  }),
});

// Non-professional roles schema
const regularUserSchema = baseUserSchema.extend({
  role: z.enum(["system_admin", "five_am_admin", "five_am_agent", "client_admin", "front_desk"]),
});

// Create discriminated union for the form
const userFormSchema = z.discriminatedUnion("role", [
  technicianUserSchema,
  interpretingDoctorUserSchema,
  regularUserSchema,
]);

type UserFormData = z.infer<typeof userFormSchema>;

export function UserForm({ mode, userId, organizationId, onSuccess, onCancel }: UserFormProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [loadingInitialData, setLoadingInitialData] = useState(mode === "edit");

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      organizationId: organizationId || "",
      role: "system_admin" as const, // Start with a default role
      security: {
        banned: false,
        banReason: "",
        emailVerified: false,
      },
    },
  });

  // Load user data for edit mode
  useEffect(() => {
    if (mode === "edit" && userId) {
      loadUserData();
    }
  }, [mode, userId]);

  const loadUserData = async () => {
    try {
      setLoadingInitialData(true);
      const result = await getUserById({ userId: userId! });

      if (result.success && result.data) {
        const user = result.data;
        
        // Get primary membership role
        const primaryMembership = user.memberships?.[0];
        const userRole = primaryMembership?.role as UserRole;
        
        setSelectedRole(userRole);
        
        // Set base user data
        const baseData = {
          name: user.name || "",
          email: user.email,
          organizationId: organizationId || "",
          role: userRole,
          security: {
            banned: user.banned || false,
            banReason: user.banReason || "",
            emailVerified: user.emailVerified || false,
          },
        };

        // Handle professional details based on role
        if (userRole === "technician" && user.technicianProfile) {
          form.reset({
            ...baseData,
            role: "technician",
            professionalDetails: {
              firstName: user.technicianProfile.firstName,
              lastName: user.technicianProfile.lastName,
              middleName: user.technicianProfile.middleName || "",
              phone: user.technicianProfile.phone || "",
              email: user.technicianProfile.email || "",
              addressLine1: user.technicianProfile.addressLine1 || "",
              addressLine2: user.technicianProfile.addressLine2 || "",
              city: user.technicianProfile.city || "",
              state: user.technicianProfile.state || "",
              code: user.technicianProfile.code || "",
              licenseNumber: user.technicianProfile.licenseNumber || "",
              specialty: user.technicianProfile.specialty as any,
              certificationLevel: user.technicianProfile.certificationLevel as any,
              employmentStatus: user.technicianProfile.employmentStatus as any,
            },
          });
        } else if (userRole === "interpreting_doctor" && user.interpretingDoctorProfile) {
          form.reset({
            ...baseData,
            role: "interpreting_doctor",
            professionalDetails: {
              firstName: user.interpretingDoctorProfile.firstName,
              lastName: user.interpretingDoctorProfile.lastName,
              middleName: user.interpretingDoctorProfile.middleName || "",
              phone: user.interpretingDoctorProfile.phone || "",
              email: user.interpretingDoctorProfile.email || "",
              addressLine1: user.interpretingDoctorProfile.addressLine1 || "",
              addressLine2: user.interpretingDoctorProfile.addressLine2 || "",
              city: user.interpretingDoctorProfile.city || "",
              state: user.interpretingDoctorProfile.state || "",
              code: user.interpretingDoctorProfile.code || "",
              licenseNumber: user.interpretingDoctorProfile.licenseNumber,
              primarySpecialty: user.interpretingDoctorProfile.primarySpecialty as any,
              secondarySpecialty: user.interpretingDoctorProfile.secondarySpecialty as any,
              readingStatus: user.interpretingDoctorProfile.readingStatus as any,
              emergencyReads: user.interpretingDoctorProfile.emergencyReads,
              weekendReads: user.interpretingDoctorProfile.weekendReads,
              nightReads: user.interpretingDoctorProfile.nightReads,
            },
          });
        } else {
          // Regular user role without professional details
          form.reset(baseData as any);
        }
      } else {
        setError(getErrorMessage(result.error || "Failed to load user data"));
      }
    } catch (err) {
      setError("Failed to load user data");
    } finally {
      setLoadingInitialData(false);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsLoading(true);
      setError("");

      console.log("Submitting form data:", data);

      let result;
      
      if (mode === "create") {
        result = await createUser({
          userData: data,
          sendInvitation: true,
        });
      } else {
        result = await updateUser({
          userId: userId!,
          userData: data,
        });
      }

      console.log("Action result:", result);

      if (result.success) {
        onSuccess?.();
      } else {
        setError(getErrorMessage(result.error || `Failed to ${mode} user`));
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError(`Failed to ${mode} user`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    
    // Reset form with new role structure
    const currentData = form.getValues();
    
    if (role === "technician") {
      form.reset({
        ...currentData,
        role: "technician",
        professionalDetails: {
          firstName: "",
          lastName: "",
          middleName: "",
          phone: "",
          email: currentData.email || "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          code: "",
          licenseNumber: "",
          specialty: "radiology",
          certificationLevel: "entry_level",
          employmentStatus: "full_time",
        },
      });
    } else if (role === "interpreting_doctor") {
      form.reset({
        ...currentData,
        role: "interpreting_doctor",
        professionalDetails: {
          firstName: "",
          lastName: "",
          middleName: "",
          phone: "",
          email: currentData.email || "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          code: "",
          licenseNumber: "",
          primarySpecialty: "radiology",
          secondarySpecialty: undefined,
          readingStatus: "active",
          emergencyReads: false,
          weekendReads: false,
          nightReads: false,
        },
      });
    } else {
      // Regular role without professional details
      form.reset({
        ...currentData,
        role: role as any,
      });
    }
  };

  // Get available roles
  const availableRoles = getAvailableRoles("system_admin", "admin");

  if (loadingInitialData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
            <CardDescription>
              Core user account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter full name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={handleRoleChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value} disabled={role.disabled}>
                            <span>{role.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Details Section - For Technicians */}
        {selectedRole === "technician" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Technician Details</span>
              </CardTitle>
              <CardDescription>
                Technical certification and professional information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="professionalDetails.firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="professionalDetails.middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Middle name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="professionalDetails.lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="professionalDetails.specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="radiology">Radiology</SelectItem>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="mammography">Mammography</SelectItem>
                          <SelectItem value="ultrasound">Ultrasound</SelectItem>
                          <SelectItem value="ct_scan">CT Scan</SelectItem>
                          <SelectItem value="mri">MRI</SelectItem>
                          <SelectItem value="pet_scan">PET Scan</SelectItem>
                          <SelectItem value="bone_density">Bone Density</SelectItem>
                          <SelectItem value="nuclear_medicine">Nuclear Medicine</SelectItem>
                          <SelectItem value="interventional">Interventional</SelectItem>
                          <SelectItem value="fluoroscopy">Fluoroscopy</SelectItem>
                          <SelectItem value="angiography">Angiography</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="professionalDetails.certificationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certification Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="entry_level">Entry Level</SelectItem>
                          <SelectItem value="certified">Certified</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="specialist">Specialist</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="professionalDetails.licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Professional license number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Professional Details Section - For Interpreting Doctors */}
        {selectedRole === "interpreting_doctor" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Medical Professional Details</span>
              </CardTitle>
              <CardDescription>
                Medical licensing and certification details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="professionalDetails.firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="professionalDetails.middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Middle name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="professionalDetails.lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="professionalDetails.licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical License Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="License number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="professionalDetails.primarySpecialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Specialty *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select primary specialty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="radiology">Radiology</SelectItem>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="pathology">Pathology</SelectItem>
                          <SelectItem value="nuclear_medicine">Nuclear Medicine</SelectItem>
                          <SelectItem value="mammography">Mammography</SelectItem>
                          <SelectItem value="echocardiography">Echocardiography</SelectItem>
                          <SelectItem value="holter_monitoring">Holter Monitoring</SelectItem>
                          <SelectItem value="ekg_interpretation">EKG Interpretation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="professionalDetails.emergencyReads"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Emergency Reads</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="professionalDetails.weekendReads"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Weekend Reads</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="professionalDetails.nightReads"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Night Reads</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Settings - Only for edit mode */}
        {mode === "edit" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>
                Account security and access control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="security.banned"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Ban User</FormLabel>
                      <FormDescription>
                        Prevent this user from accessing the system
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("security.banned") && (
                <FormField
                  control={form.control}
                  name="security.banReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ban Reason</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explain why this user is being banned"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create User" : "Update User"}
          </Button>
        </div>
      </form>
    </Form>
  );
}