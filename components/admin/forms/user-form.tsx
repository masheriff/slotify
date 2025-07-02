'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { userFormSchema, type UserFormInput } from '@/schemas/users.schemas';
import { createUser, updateUser, getUserById, getOrganizationsForUserCreation } from '@/actions/users.actions';
import { 
  type UserFormProps, 
  type OrganizationWithType,
  ADMIN_ORG_ROLES,
  CLIENT_ORG_ROLES 
} from '@/types/users.types';
import { getRolesByOrganizationType, getRoleLabel, getOrganizationTypeLabel } from '@/utils';

export function UserForm({ mode, userId, onSuccess, initialData }: UserFormProps) {
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
          const user = await getUserById(userId as string);
          if (user && user.organizations.length > 0) {
            const primaryOrg = user.organizations[0];
            form.reset({
              name: user.name || '',
              email: user.email || '',
              organizationId: primaryOrg.organization.id,
              role: primaryOrg.member.role as any,
            });
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
        onSuccess?.();
        
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
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter full name" 
                      {...field} 
                      disabled={isLoading}
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
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="Enter email address" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
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
                          <div className="flex flex-col">
                            <span>{org.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {getOrganizationTypeLabel(org.metadata.type)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Processing...' : mode === 'create' ? 'Create User' : 'Update User'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onSuccess?.()} 
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