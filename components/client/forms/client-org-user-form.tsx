// components/client/forms/client-org-user-form.tsx
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
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

import { userFormSchema, type UserFormInput } from '@/schemas/users.schemas';
import { createUser, updateUser, getUserById } from '@/actions/users.actions';
import { CLIENT_ORG_ROLES } from '@/types/users.types';
import { getRoleLabel } from '@/utils/users.utils';
import { getErrorMessage } from "@/types";

interface ClientOrgUserFormProps {
  mode: 'create' | 'edit';
  userId?: string;
  organizationId: string;
  organizationSlug: string;
  onSuccess?: () => void;
  initialData?: UserFormInput;
}

export function ClientOrgUserForm({ 
  mode, 
  userId, 
  organizationId, 
  organizationSlug,
  onSuccess,
  initialData 
}: ClientOrgUserFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const form = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      organizationId: organizationId, // Auto-populated from props
      role: '' as any,
    },
  });

  // Load user data for edit mode
  useEffect(() => {
    if (mode === 'edit' && userId) {
      async function loadUser() {
        setIsLoadingUser(true);
        try {
          const result = await getUserById(userId as string);
          if (result.success && result.data) {
            const userData = result.data;
            form.reset({
              name: userData.name || '',
              email: userData.email,
              organizationId: organizationId,
              role: (userData.role || '') as UserFormInput['role'],
            });
          } else {
            toast.error('Failed to load user data');
            router.push(`/${organizationSlug}/staff/users`);
          }
        } catch (error) {
          console.error('Error loading user:', error);
          toast.error('Failed to load user data');
          router.push(`/${organizationSlug}/staff/users`);
        } finally {
          setIsLoadingUser(false);
        }
      }

      loadUser();
    }
  }, [mode, userId, organizationId, organizationSlug, form, router]);

  // Handle form submission
  async function onSubmit(data: UserFormInput) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('organizationId', organizationId); // Use the passed organizationId
      formData.append('role', data.role);
      
      if (mode === 'edit' && userId) {
        formData.append('id', userId);
      }

      const result = mode === 'edit' 
        ? await updateUser(formData)
        : await createUser(formData);

      if (result.success) {
        toast.success(result.message);
        
        if (onSuccess) {
          onSuccess();
        } else {
          // Default navigation behavior for client org
          if (mode === 'create') {
            router.push(`/${organizationSlug}/staff/users`);
          } else {
            router.push(`/${organizationSlug}/staff/users/${userId}`);
          }
          router.refresh();
        }
        
        if (mode === 'create') {
          form.reset({
            name: '',
            email: '',
            organizationId: organizationId,
            role: undefined,
          });
        }
      } else {
        toast.error(getErrorMessage(result.message || result.error || 'Failed to save user'));
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  // Get available client organization roles
  const availableRoles = Object.values(CLIENT_ORG_ROLES);

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
          {mode === 'create' ? 'Add New Staff Member' : 'Edit Staff Member'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Add a new team member with the appropriate role and permissions.'
            : 'Update staff member information and permissions.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
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
                  <FormDescription>
                    The staff member's full name as it should appear in the system.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter email address" 
                      type="email"
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    A magic link invitation will be sent to this email address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role Field - Only Client Organization Roles */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {getRoleLabel(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The staff member's role determines their permissions within the organization.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Processing...' : mode === 'create' ? 'Create Staff Member' : 'Update Staff Member'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  if (onSuccess) {
                    onSuccess();
                  } else {
                    router.push(`/${organizationSlug}/staff/users`);
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