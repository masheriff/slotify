// components/admin/forms/user-form.tsx - FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

import { userFormSchema, type UserFormInput } from '@/schemas/users.schemas';
import { createUser, updateUser, getUserById, getOrganizationsForUserCreation } from '@/actions/users.actions';
import { 
  type UserFormProps, 
  type OrganizationWithType,
  ADMIN_ORG_ROLES,
  CLIENT_ORG_ROLES 
} from '@/types/users.types';
import { getRoleLabel, getRolesByOrganizationType } from '@/utils/users.utils';
import { getOrganizationTypeLabel } from '@/utils/organization.utils';
import { getErrorMessage } from "@/types";

interface UserFormPropsFixed {
  mode: 'create' | 'edit';
  userId?: string;
  onSuccess?: () => void;
  initialData?: UserFormInput;
}

export function UserForm({ mode, userId, onSuccess, initialData }: UserFormPropsFixed) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationWithType[]>([]);
  const [selectedOrgType, setSelectedOrgType] = useState<'admin' | 'client' | null>(null);

  const form = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      organizationId: '',
      role: '' as any,
    },
  });

  const watchedOrganizationId = form.watch('organizationId');

  // Load organizations on component mount
  useEffect(() => {
    async function loadOrganizations() {
      try {
        const orgs = await getOrganizationsForUserCreation();
        setOrganizations(orgs as unknown as OrganizationWithType[]);
      } catch (error) {
        console.error('Error loading organizations:', error);
        toast.error('Failed to load organizations');
      }
    }

    loadOrganizations();
  }, []);

  // FIXED: Load user data for edit mode with proper organization type setting
  useEffect(() => {
    if (mode === 'edit' && userId) {
      async function loadUser() {
        setIsLoadingUser(true);
        try {
          const result = await getUserById(userId as string);
          if (result.success && result.data) {
            const userData = result.data;
            console.log('Loaded user data:', userData);
            
            // FIXED: Set form values properly
            form.reset({
              name: userData.name || '',
              email: userData.email || '',
              organizationId: userData.organization?.id || '',
              role: userData.role as any,
            });

            // FIXED: Set selected organization type after form is populated
            if (userData.organization) {
              const orgType = userData.organization.type;
              console.log('Setting organization type:', orgType);
              setSelectedOrgType(orgType);
            }
          } else {
            console.error('Failed to load user:', result.error);
            toast.error('Failed to load user data');
          }
        } catch (error) {
          console.error('Error loading user:', error);
          toast.error('Failed to load user data');
        } finally {
          setIsLoadingUser(false);
        }
      }

      loadUser();
    } else if (initialData) {
      form.reset(initialData);
    }
  }, [mode, userId, initialData, form]);

  // FIXED: Update selected organization type when organization changes
  useEffect(() => {
    if (watchedOrganizationId && organizations.length > 0) {
      const selectedOrg = organizations.find(org => org.id === watchedOrganizationId);
      if (selectedOrg) {
        const orgType = selectedOrg.metadata?.type || selectedOrg.metadata.type;
        console.log('Organization changed, setting type:', orgType);
        setSelectedOrgType(orgType);
        
        // FIXED: Only reset role if this is not during initial load
        if (!isLoadingUser) {
          form.setValue('role', '' as any);
        }
      }
    } else if (!watchedOrganizationId) {
      setSelectedOrgType(null);
      if (!isLoadingUser) {
        form.setValue('role', '' as any);
      }
    }
  }, [watchedOrganizationId, organizations, form, isLoadingUser]);

  async function onSubmit(data: UserFormInput) {
    setIsLoading(true);
    
    try {
      console.log('Submitting form data:', data);
      
      const formData = new FormData();
      
      if (mode === 'edit' && userId) {
        formData.append('id', userId);
      }
      
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('organizationId', data.organizationId);
      formData.append('role', data.role);

      const result = mode === 'edit' 
        ? await updateUser(formData)
        : await createUser(formData);

      if (result.success) {
        toast.success(result.message);
        
        if (onSuccess) {
          onSuccess();
        } else {
          // Default navigation behavior
          if (mode === 'create') {
            router.push('/5am-corp/admin/users');
          } else {
            router.push(`/5am-corp/admin/users/${userId}`);
          }
          router.refresh();
        }
        
        if (mode === 'create') {
          form.reset();
          setSelectedOrgType(null);
        }
      } else {
        // console.error('Form submission failed:', result.error);
        toast.error(getErrorMessage(result.message || result.error || 'Failed to save user'));
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  // Get available roles for selected organization
  const availableRoles = selectedOrgType ? getRolesByOrganizationType(selectedOrgType) : [];

  // Group roles by type for better UX
  const adminRoles = availableRoles.filter(role => 
    Object.values(ADMIN_ORG_ROLES).includes(role as any)
  );
  const clientRoles = availableRoles.filter(role => 
    Object.values(CLIENT_ORG_ROLES).includes(role as any)
  );

  // Show loading state for edit mode
  if (mode === 'edit' && isLoadingUser) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading user data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Create New User' : 'Edit User'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Add a new user to the system with the appropriate role and organization access.'
            : 'Update user information and permissions.'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* User Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter user's full name" 
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    The user's display name in the system.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="user@example.com" 
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    This email will be used for login and notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Organization - FIXED: Use value instead of defaultValue */}
            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value} // FIXED: Use value instead of defaultValue
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an organization" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name} ({getOrganizationTypeLabel(org.metadata?.type || org.metadata.type)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The organization this user will belong to.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role - FIXED: Use value instead of defaultValue */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value} // FIXED: Use value instead of defaultValue
                      disabled={isLoading || !selectedOrgType}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue 
                            placeholder={
                              selectedOrgType 
                                ? "Select a role" 
                                : "Select an organization first"
                            } 
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedOrgType === 'admin' && adminRoles.length > 0 && (
                          <SelectGroup>
                            <SelectLabel>Admin Organization Roles</SelectLabel>
                            {adminRoles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {getRoleLabel(role)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                        
                        {selectedOrgType === 'client' && clientRoles.length > 0 && (
                          <SelectGroup>
                            <SelectLabel>Client Organization Roles</SelectLabel>
                            {clientRoles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {getRoleLabel(role)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The user's role determines their permissions within the organization.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Processing...' : mode === 'create' ? 'Create User' : 'Update User'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  if (onSuccess) {
                    onSuccess();
                  } else {
                    router.back();
                  }
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}