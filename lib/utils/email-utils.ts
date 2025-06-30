// lib/utils/email-utils.ts

import { emailSchema, multipleEmailsSchema } from "@/schemas";


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