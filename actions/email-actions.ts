// app/actions/email-actions.ts
'use server';

import { emailSender } from '@/lib/email/email-sender';
import { 
  welcomeEmailSchema, 
  notificationEmailSchema, 
  bulkNotificationSchema,
  magicLinkEmailSchema,
  formatRecipientName,
  sanitizeEmailContent, 
  organizationInvitationEmailSchema
} from '@/lib/utils/email-utils';
import { EmailSendResult } from '@/types/email.types';

export async function sendWelcomeEmail(formData: FormData): Promise<EmailSendResult> {
  try {
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      loginUrl: formData.get('loginUrl') as string || undefined,
    };

    // Validate input
    const validatedData = welcomeEmailSchema.parse(data);

    // Format the name
    const formattedName = formatRecipientName(validatedData.name);

    // Send welcome email
    const result = await emailSender.sendWelcomeEmail(validatedData.email, {
      name: formattedName,
      email: validatedData.email,
      loginUrl: validatedData.loginUrl,
    });

    return result;
  } catch (error) {
    console.error('Welcome email action failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send welcome email',
    };
  }
}

export async function sendNotificationEmail(formData: FormData): Promise<EmailSendResult> {
  try {
    const data = {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      title: formData.get('title') as string,
      message: formData.get('message') as string,
      actionUrl: formData.get('actionUrl') as string || undefined,
      actionText: formData.get('actionText') as string || undefined,
    };

    // Validate input
    const validatedData = notificationEmailSchema.parse({
      name: data.name,
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl,
      actionText: data.actionText,
    });

    // Sanitize content
    const sanitizedMessage = sanitizeEmailContent(validatedData.message);
    const formattedName = formatRecipientName(validatedData.name);

    // Send notification email
    const result = await emailSender.sendNotificationEmail(data.email, {
      name: formattedName,
      title: validatedData.title,
      message: sanitizedMessage,
      actionUrl: validatedData.actionUrl,
      actionText: validatedData.actionText,
    });

    return result;
  } catch (error) {
    console.error('Notification email action failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send notification email',
    };
  }
}

export async function sendBulkNotificationEmails(formData: FormData): Promise<{
  success: boolean;
  results?: Array<{ email: string; result: EmailSendResult }>;
  error?: string;
}> {
  try {
    const emailsString = formData.get('emails') as string;
    const emails = emailsString.split(',').map(email => email.trim()).filter(Boolean);
    
    const data = {
      emails,
      title: formData.get('title') as string,
      message: formData.get('message') as string,
      actionUrl: formData.get('actionUrl') as string || undefined,
      actionText: formData.get('actionText') as string || undefined,
    };

    // Validate input
    const validatedData = bulkNotificationSchema.parse(data);

    // Sanitize content
    const sanitizedMessage = sanitizeEmailContent(validatedData.message);

    // Send bulk notifications
    const results = await emailSender.sendBulkNotifications(validatedData.emails, {
      name: 'User', // Generic name for bulk emails
      title: validatedData.title,
      message: sanitizedMessage,
      actionUrl: validatedData.actionUrl,
      actionText: validatedData.actionText,
    });

    const successCount = results.filter(r => r.result.success).length;
    const totalCount = results.length;

    return {
      success: successCount > 0,
      results,
    };
  } catch (error) {
    console.error('Bulk notification email action failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send bulk notification emails',
    };
  }
}

// Direct function calls (for programmatic use)
export async function sendWelcomeEmailDirect(data: {
  name: string;
  email: string;
  loginUrl?: string;
}): Promise<EmailSendResult> {
  try {
    const validatedData = welcomeEmailSchema.parse(data);
    const formattedName = formatRecipientName(validatedData.name);

    return await emailSender.sendWelcomeEmail(validatedData.email, {
      name: formattedName,
      email: validatedData.email,
      loginUrl: validatedData.loginUrl,
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send welcome email',
    };
  }
}

export async function sendMagicLinkEmail(data: {
  email: string;
  url: string;
  expiresIn?: string;
}): Promise<EmailSendResult> {
  try {
    const validatedData = magicLinkEmailSchema.parse(data);

    return await emailSender.sendMagicLinkEmail(validatedData.email, {
      email: validatedData.email,
      url: validatedData.url,
      expiresIn: validatedData.expiresIn || '5 minutes',
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send magic link email',
    };
  }
}

export async function sendOrganizationInvitationEmail(data: {
  email: string;
  organizationName: string;
  inviterName: string;
  invitationLink: string;
  expiresIn?: string;
}): Promise<EmailSendResult> {
  try {
    const validatedData = organizationInvitationEmailSchema.parse(data);

    return await emailSender.sendOrganizationInvitationEmail(validatedData.email, {
      email: validatedData.email,
      organizationName: validatedData.organizationName,
      inviterName: validatedData.inviterName,
      invitationLink: validatedData.invitationLink,
      expiresIn: validatedData.expiresIn || '7 days',
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send organization invitation email',
    };
  }
}