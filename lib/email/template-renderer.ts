// lib/email/template-renderer.ts
import { render } from '@react-email/render';
import { WelcomeEmail } from '../../emails/welcome';
import { NotificationEmail } from '../../emails/notification';
import { MagicLinkEmail } from '../../emails/magic-link';
import { OrganizationInvitationEmail } from '../../emails/organization-invitation';
import { WelcomeEmailProps, NotificationEmailProps, MagicLinkEmailProps, TemplateData, OrganizationInvitationEmailProps, OTPVerificationEmailProps } from '../../types/email.types';
import { OTPVerificationEmail } from '@/emails/otp-verification-email';

export type EmailTemplate = 'welcome' | 'notification' | 'magic-link' | 'organization-invitation' | 'otp-verification-email';



class TemplateRenderer {
  async renderTemplate<T extends EmailTemplate>(
    template: T,
    data: TemplateData[T]
  ): Promise<{ html: string; subject: string }> {
    let html: string;
    let subject: string;

    try {
      switch (template) {
        case 'welcome':
          const welcomeData = data as WelcomeEmailProps;
          html = await render(WelcomeEmail(welcomeData));
          subject = `Welcome to Slotify, ${welcomeData.name}!`;
          break;

        case 'notification':
          const notificationData = data as NotificationEmailProps;
          html = await render(NotificationEmail(notificationData));
          subject = `${notificationData.title} - Slotify`;
          break;

        case 'magic-link':
          const magicLinkData = data as MagicLinkEmailProps;
          html = await render(MagicLinkEmail(magicLinkData));
          subject = 'Your secure login link for Slotify';
          break;

        case 'organization-invitation':
          const orgInvitationData = data as OrganizationInvitationEmailProps;
          html = await render(OrganizationInvitationEmail(orgInvitationData));
          subject = `You're invited to join ${orgInvitationData.organizationName} on Slotify`;
          break;

        case 'otp-verification-email':
          const otpVerificationEmailData = data as OTPVerificationEmailProps;
          html = await render(OTPVerificationEmail(otpVerificationEmailData));
          subject = 'Your OTP to verify your email';
          break;

        default:
          throw new Error(`Unknown template: ${template}`);
      }

      return { html, subject };
    } catch (error) {
      console.error(`Failed to render template "${template}":`, error);
      throw new Error(`Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async renderWelcomeEmail(data: WelcomeEmailProps) {
    return this.renderTemplate('welcome', data);
  }

  async renderMagicLinkEmail(data: MagicLinkEmailProps) {
    return this.renderTemplate('magic-link', data);
  }

  async renderOrganizationInvitationEmail(data: OrganizationInvitationEmailProps) {
    return this.renderTemplate('organization-invitation', data);
  }

  // Preview method for development
  async previewTemplate<T extends EmailTemplate>(
    template: T,
    data: TemplateData[T]
  ): Promise<string> {
    const { html } = await this.renderTemplate(template, data);
    return html;
  }
}

// Create singleton instance
export const templateRenderer = new TemplateRenderer();