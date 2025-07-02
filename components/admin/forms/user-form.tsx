// components/admin/forms/user-form.tsx
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

// FIXED: Updated props interface to make onSuccess optional
interface UserFormPropsFixed {
  mode: 'create' | 'edit';
  userId?: string;
  onSuccess?: () => void; // Made optional
  initialData?: UserFormInput;
}

export function UserForm({ mode, userId, onSuccess, initialData }: UserFormPropsFixed) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
        toast.error('Failed to load organizations');
      }
    }

    loadOrganizations();
  }, []);

  // Load user data for edit mode
  useEffect(() => {
    if (mode === 'edit' && userId) {
      async function loadUser() {
        try {
          const result = await getUserById(userId as string);
          if (result.success && result.data) {
            const userData = result.data;
            
            // Set form values
            form.reset({
              name: userData.name || '',
              email: userData.email || '',
              organizationId: userData.organization?.id || '',
              role: userData.role as any,
            });

            // Set selected organization type
            if (userData.organization) {
              setSelectedOrgType(userData.organization.type);
            }
          } else {
            toast.error('Failed to load user data');
          }
        } catch (error) {
          toast.error('Failed to load user data');
        }
      }

      loadUser();
    } else if (initialData) {
      form.reset(initialData);
    }
  }, [mode, userId, initialData, form]);

  // Update selected organization type when organization changes
  useEffect(() => {
    if (watchedOrganizationId) {
      const selectedOrg = organizations.find(org => org.id === watchedOrganizationId);
      if (selectedOrg) {
        const orgType = selectedOrg.metadata.type;
        setSelectedOrgType(orgType);
        // Reset role when organization changes
        form.setValue('role', '' as any);
      }
    } else {
      setSelectedOrgType(null);
      form.setValue('role', '' as any);
    }
  }, [watchedOrganizationId, organizations, form]);

  async function onSubmit(data: UserFormInput) {
    setIsLoading(true);
    
    try {
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
        
        // FIXED: Check if onSuccess is provided before calling it
        if (onSuccess) {
          onSuccess();
        } else {
          // Default navigation behavior when no onSuccess callback is provided
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
        toast.error(result.message);
      }
    } catch (error) {
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

            {/* Organization */}
            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
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
                          {org.name} ({getOrganizationTypeLabel(org.metadata.type)})
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

            {/* Role */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
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
                  // FIXED: Check if onSuccess exists before calling, otherwise use router.back()
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