// components/admin/forms/user-form.tsx - Dynamic User Form with Conditional Fields
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, User, Shield, Briefcase } from "lucide-react";

import { createUserSchema, updateUserSchema } from "@/schemas/user.schemas";
import { UserFormProps, UserRole } from "@/types/user.types";
import { createUser, updateUser, getUserById } from "@/actions/user-actions";
import { getAvailableRoles, getRoleDisplayName, requiresProfessionalDetails } from "@/lib/utils/user-utils";
import { getErrorMessage } from "@/types";


export function UserForm({ mode, userId, organizationId, onSuccess, onCancel }: UserFormProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [loadingInitialData, setLoadingInitialData] = useState(mode === "edit");

  // Form schema based on mode
  const schema = mode === "create" ? createUserSchema : updateUserSchema;
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      organizationId: organizationId || "",
      role: "" as UserRole,
      professionalDetails: undefined,
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
        const primaryMembership = user.memberships[0]; // Get primary membership
        
        // Set form values
        form.reset({
          name: user.name || "",
          email: user.email,
          organizationId: primaryMembership?.organizationId || "",
          role: primaryMembership?.role as UserRole || "" as UserRole,
          security: {
            banned: user.banned || false,
            banReason: user.banReason || "",
            emailVerified: user.emailVerified,
          },
        });
        
        setSelectedRole(primaryMembership?.role as UserRole || "");
        
        // Set professional details if available
        if (user.technicianProfile) {
          form.setValue("professionalDetails", {
            firstName: user.technicianProfile.firstName,
            middleName: user.technicianProfile.middleName || "",
            lastName: user.technicianProfile.lastName,
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
          });
        }
        
        if (user.interpretingDoctorProfile) {
          form.setValue("professionalDetails", {
            firstName: user.interpretingDoctorProfile.firstName,
            middleName: user.interpretingDoctorProfile.middleName || "",
            lastName: user.interpretingDoctorProfile.lastName,
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
          });
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

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      setError("");

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

      if (result.success) {
        onSuccess?.();
      } else {
        setError(getErrorMessage(result.error || `Failed to ${mode} user`));
      }
    } catch (err) {
      setError(`Failed to ${mode} user`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    form.setValue("role", role);
    
    // Clear professional details when role changes
    if (!requiresProfessionalDetails(role)) {
      form.setValue("professionalDetails", undefined);
    }
  };

  // Get available roles (this would need to be customized based on user permissions)
  const availableRoles = getAvailableRoles("system_admin", "admin"); // TODO: Use actual current user role

  if (loadingInitialData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter full name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="Enter email address"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value} disabled={role.disabled}>
                    <div className="flex items-center space-x-2">
                      <span>{role.label}</span>
                      {role.disabled && (
                        <Badge variant="secondary" className="text-xs">
                          Not Available
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-red-600">{form.formState.errors.role.message}</p>
            )}
            
            {selectedRole && (
              <div className="mt-2">
                <Badge className="text-xs">
                  Selected: {getRoleDisplayName(selectedRole)}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Professional Details Section - Conditional */}
      {selectedRole && requiresProfessionalDetails(selectedRole) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Professional Details</span>
            </CardTitle>
            <CardDescription>
              {selectedRole === "technician" 
                ? "Technician certification and specialty information"
                : "Medical professional credentials and specialties"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedRole === "technician" && (
              <TechnicianFieldsSection form={form} />
            )}
            
            {selectedRole === "interpreting_doctor" && (
              <InterpretingDoctorFieldsSection form={form} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Section - Only for edit mode and admins */}
      {mode === "edit" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security Settings</span>
            </CardTitle>
            <CardDescription>
              Account security and verification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailVerified"
                checked={form.watch("security.emailVerified")}
                onCheckedChange={(checked) => 
                  form.setValue("security.emailVerified", checked as boolean)
                }
              />
              <Label htmlFor="emailVerified">Email Verified</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="banned"
                checked={form.watch("security.banned")}
                onCheckedChange={(checked) => 
                  form.setValue("security.banned", checked as boolean)
                }
              />
              <Label htmlFor="banned">Banned</Label>
            </div>

            {form.watch("security.banned") && (
              <div className="space-y-2">
                <Label htmlFor="banReason">Ban Reason</Label>
                <Textarea
                  id="banReason"
                  {...form.register("security.banReason")}
                  placeholder="Enter reason for ban"
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {mode === "create" ? "Create User" : "Update User"}
        </Button>
      </div>
    </form>
  );
}

// Technician Fields Subsection
function TechnicianFieldsSection({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tech-firstName">First Name *</Label>
          <Input
            id="tech-firstName"
            {...form.register("professionalDetails.firstName")}
            placeholder="First name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tech-middleName">Middle Name</Label>
          <Input
            id="tech-middleName"
            {...form.register("professionalDetails.middleName")}
            placeholder="Middle name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tech-lastName">Last Name *</Label>
          <Input
            id="tech-lastName"
            {...form.register("professionalDetails.lastName")}
            placeholder="Last name"
          />
        </div>
      </div>

      <Separator />

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tech-phone">Phone</Label>
          <Input
            id="tech-phone"
            {...form.register("professionalDetails.phone")}
            placeholder="Phone number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tech-email">Professional Email</Label>
          <Input
            id="tech-email"
            type="email"
            {...form.register("professionalDetails.email")}
            placeholder="Professional email (optional)"
          />
        </div>
      </div>

      {/* Professional Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tech-specialty">Specialty *</Label>
          <Select 
            value={form.watch("professionalDetails.specialty")} 
            onValueChange={(value) => form.setValue("professionalDetails.specialty", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="radiology">Radiology</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="mammography">Mammography</SelectItem>
              <SelectItem value="ultrasound">Ultrasound</SelectItem>
              <SelectItem value="ct_scan">CT Scan</SelectItem>
              <SelectItem value="mri">MRI</SelectItem>
              <SelectItem value="pet_scan">PET Scan</SelectItem>
              <SelectItem value="bone_density">Bone Density</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tech-certification">Certification Level</Label>
          <Select 
            value={form.watch("professionalDetails.certificationLevel")} 
            onValueChange={(value) => form.setValue("professionalDetails.certificationLevel", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select certification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry_level">Entry Level</SelectItem>
              <SelectItem value="certified">Certified</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="specialist">Specialist</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tech-employment">Employment Status</Label>
          <Select 
            value={form.watch("professionalDetails.employmentStatus")} 
            onValueChange={(value) => form.setValue("professionalDetails.employmentStatus", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="per_diem">Per Diem</SelectItem>
              <SelectItem value="temp">Temporary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tech-license">License Number</Label>
        <Input
          id="tech-license"
          {...form.register("professionalDetails.licenseNumber")}
          placeholder="Professional license number (optional)"
        />
      </div>

      <Separator />

      {/* Address */}
      <div className="space-y-4">
        <h4 className="font-medium">Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tech-address1">Address Line 1</Label>
            <Input
              id="tech-address1"
              {...form.register("professionalDetails.addressLine1")}
              placeholder="Street address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tech-address2">Address Line 2</Label>
            <Input
              id="tech-address2"
              {...form.register("professionalDetails.addressLine2")}
              placeholder="Apartment, suite, etc."
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tech-city">City</Label>
            <Input
              id="tech-city"
              {...form.register("professionalDetails.city")}
              placeholder="City"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tech-state">State</Label>
            <Input
              id="tech-state"
              {...form.register("professionalDetails.state")}
              placeholder="State"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tech-code">ZIP Code</Label>
            <Input
              id="tech-code"
              {...form.register("professionalDetails.code")}
              placeholder="ZIP code"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Interpreting Doctor Fields Subsection
function InterpretingDoctorFieldsSection({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="doc-firstName">First Name *</Label>
          <Input
            id="doc-firstName"
            {...form.register("professionalDetails.firstName")}
            placeholder="First name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="doc-middleName">Middle Name</Label>
          <Input
            id="doc-middleName"
            {...form.register("professionalDetails.middleName")}
            placeholder="Middle name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="doc-lastName">Last Name *</Label>
          <Input
            id="doc-lastName"
            {...form.register("professionalDetails.lastName")}
            placeholder="Last name"
          />
        </div>
      </div>

      <Separator />

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="doc-phone">Phone</Label>
          <Input
            id="doc-phone"
            {...form.register("professionalDetails.phone")}
            placeholder="Phone number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="doc-email">Professional Email</Label>
          <Input
            id="doc-email"
            type="email"
            {...form.register("professionalDetails.email")}
            placeholder="Professional email (optional)"
          />
        </div>
      </div>

      {/* Medical Credentials */}
      <div className="space-y-2">
        <Label htmlFor="doc-license">Medical License Number *</Label>
        <Input
          id="doc-license"
          {...form.register("professionalDetails.licenseNumber")}
          placeholder="Medical license number"
        />
      </div>

      {/* Specialties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="doc-primary-specialty">Primary Specialty *</Label>
          <Select 
            value={form.watch("professionalDetails.primarySpecialty")} 
            onValueChange={(value) => form.setValue("professionalDetails.primarySpecialty", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select primary specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="radiology">Radiology</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="pathology">Pathology</SelectItem>
              <SelectItem value="nuclear_medicine">Nuclear Medicine</SelectItem>
              <SelectItem value="mammography">Mammography</SelectItem>
              <SelectItem value="ultrasound">Ultrasound</SelectItem>
              <SelectItem value="ct_scan">CT Scan</SelectItem>
              <SelectItem value="mri">MRI</SelectItem>
              <SelectItem value="pet_scan">PET Scan</SelectItem>
              <SelectItem value="interventional_radiology">Interventional Radiology</SelectItem>
              <SelectItem value="neuroradiology">Neuroradiology</SelectItem>
              <SelectItem value="pediatric_radiology">Pediatric Radiology</SelectItem>
              <SelectItem value="echocardiography">Echocardiography</SelectItem>
              <SelectItem value="stress_testing">Stress Testing</SelectItem>
              <SelectItem value="holter_monitoring">Holter Monitoring</SelectItem>
              <SelectItem value="ekg_interpretation">EKG Interpretation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="doc-secondary-specialty">Secondary Specialty</Label>
          <Select 
            value={form.watch("professionalDetails.secondarySpecialty") || ""} 
            onValueChange={(value) => form.setValue("professionalDetails.secondarySpecialty", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select secondary specialty (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              <SelectItem value="radiology">Radiology</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="pathology">Pathology</SelectItem>
              <SelectItem value="nuclear_medicine">Nuclear Medicine</SelectItem>
              <SelectItem value="mammography">Mammography</SelectItem>
              <SelectItem value="ultrasound">Ultrasound</SelectItem>
              <SelectItem value="ct_scan">CT Scan</SelectItem>
              <SelectItem value="mri">MRI</SelectItem>
              <SelectItem value="pet_scan">PET Scan</SelectItem>
              <SelectItem value="interventional_radiology">Interventional Radiology</SelectItem>
              <SelectItem value="neuroradiology">Neuroradiology</SelectItem>
              <SelectItem value="pediatric_radiology">Pediatric Radiology</SelectItem>
              <SelectItem value="echocardiography">Echocardiography</SelectItem>
              <SelectItem value="stress_testing">Stress Testing</SelectItem>
              <SelectItem value="holter_monitoring">Holter Monitoring</SelectItem>
              <SelectItem value="ekg_interpretation">EKG Interpretation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reading Status and Availability */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="doc-reading-status">Reading Status</Label>
          <Select 
            value={form.watch("professionalDetails.readingStatus")} 
            onValueChange={(value) => form.setValue("professionalDetails.readingStatus", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select reading status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
              <SelectItem value="emergency_only">Emergency Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Reading Availability</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emergency-reads"
                checked={form.watch("professionalDetails.emergencyReads")}
                onCheckedChange={(checked) => 
                  form.setValue("professionalDetails.emergencyReads", checked as boolean)
                }
              />
              <Label htmlFor="emergency-reads">Emergency Reads</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="weekend-reads"
                checked={form.watch("professionalDetails.weekendReads")}
                onCheckedChange={(checked) => 
                  form.setValue("professionalDetails.weekendReads", checked as boolean)
                }
              />
              <Label htmlFor="weekend-reads">Weekend Reads</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="night-reads"
                checked={form.watch("professionalDetails.nightReads")}
                onCheckedChange={(checked) => 
                  form.setValue("professionalDetails.nightReads", checked as boolean)
                }
              />
              <Label htmlFor="night-reads">Night Reads</Label>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Address */}
      <div className="space-y-4">
        <h4 className="font-medium">Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="doc-address1">Address Line 1</Label>
            <Input
              id="doc-address1"
              {...form.register("professionalDetails.addressLine1")}
              placeholder="Street address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-address2">Address Line 2</Label>
            <Input
              id="doc-address2"
              {...form.register("professionalDetails.addressLine2")}
              placeholder="Apartment, suite, etc."
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="doc-city">City</Label>
            <Input
              id="doc-city"
              {...form.register("professionalDetails.city")}
              placeholder="City"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-state">State</Label>
            <Input
              id="doc-state"
              {...form.register("professionalDetails.state")}
              placeholder="State"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-code">ZIP Code</Label>
            <Input
              id="doc-code"
              {...form.register("professionalDetails.code")}
              placeholder="ZIP code"
            />
          </div>
        </div>
      </div>
    </div>
  );
}