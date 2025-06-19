// lib/utils/email-utils.ts
import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string().email('Invalid email address');

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

// Utility functions
export function validateEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

export function validateMultipleEmails(emails: string[]): boolean {
  try {
    multipleEmailsSchema.parse(emails);
    return true;
  } catch {
    return false;
  }
}

export function formatEmailList(emails: string | string[]): string[] {
  if (typeof emails === 'string') {
    return [emails];
  }
  return emails;
}

export function sanitizeEmailContent(content: string): string {
  // Basic sanitization - remove potentially harmful content
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '');
}

export function generateEmailPreviewText(message: string, maxLength: number = 100): string {
  const plainText = message.replace(/<[^>]*>/g, '');
  return plainText.length > maxLength 
    ? `${plainText.substring(0, maxLength)}...` 
    : plainText;
}

// Email formatting helpers
export function formatRecipientName(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function createEmailId(): string {
  return `email_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Development helpers
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function getBaseUrl(): string {
  if (isProduction()) {
    return process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}