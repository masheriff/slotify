import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const multipleEmailsSchema = z
  .array(z.string().email('Invalid email address'))
  .min(1, 'At least one email is required');

// Welcome email validation
export const welcomeEmailSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: emailSchema,
  loginUrl: z.string().url().optional(),
});

// Magic link email validation
export const magicLinkEmailSchema = z.object({
  email: emailSchema,
  url: z.string().url('Invalid URL'),
  expiresIn: z.string().optional(),
});

// Organization invitation email validation
export const organizationInvitationEmailSchema = z.object({
  email: emailSchema,
  organizationName: z.string().min(1, 'Organization name is required'),
  inviterName: z.string().min(1, 'Inviter name is required'),
  invitationLink: z.string().url('Invalid invitation URL'),
  expiresIn: z.string().optional(),
});

// Notification email validation
export const notificationEmailSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  actionUrl: z.string().url().optional(),
  actionText: z.string().optional(),
});

// Bulk notification validation
export const bulkNotificationSchema = z.object({
  emails: multipleEmailsSchema,
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  actionUrl: z.string().url().optional(),
  actionText: z.string().optional(),
});