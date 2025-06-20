// lib/email/email-sender.ts
import { smtpClient } from "./smtp-client";
import {
  templateRenderer,
  EmailTemplate,
  TemplateData,
} from "./template-renderer";
import { EmailSendResult } from "../../types/email.types";

class EmailSender {
  constructor() {
    // Verify SMTP connection on initialization
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      const isConnected = await smtpClient.verifyConnection();
      if (!isConnected) {
        console.warn(
          "SMTP connection verification failed. Emails may not be sent."
        );
      }
    } catch (error) {
      console.error("SMTP connection error:", error);
    }
  }

  async sendTemplateEmail<T extends EmailTemplate>(
    template: T,
    to: string | string[],
    data: TemplateData[T],
    options?: {
      cc?: string | string[];
      bcc?: string | string[];
      customSubject?: string;
    }
  ): Promise<EmailSendResult> {
    try {
      // Render the template
      const { html, subject } = await templateRenderer.renderTemplate(
        template,
        data
      );

      // Send the email
      const result = await smtpClient.sendMail({
        to,
        subject: options?.customSubject || subject,
        html,
        cc: options?.cc,
        bcc: options?.bcc,
      });

      return result;
    } catch (error) {
      console.error("Failed to send template email:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async sendWelcomeEmail(
    to: string,
    data: TemplateData["welcome"],
    options?: { cc?: string | string[]; bcc?: string | string[] }
  ): Promise<EmailSendResult> {
    return this.sendTemplateEmail("welcome", to, data, options);
  }

  async sendMagicLinkEmail(
    to: string,
    data: TemplateData["magic-link"],
    options?: { customSubject?: string }
  ): Promise<EmailSendResult> {
    return this.sendTemplateEmail("magic-link", to, data, options);
  }

  async sendOrganizationInvitationEmail(
    to: string,
    data: TemplateData["organization-invitation"],
    options?: { customSubject?: string }
  ): Promise<EmailSendResult> {
    return this.sendTemplateEmail("organization-invitation", to, data, options);
  }

  async sendNotificationEmail(
    to: string | string[],
    data: TemplateData["notification"],
    options?: {
      cc?: string | string[];
      bcc?: string | string[];
      customSubject?: string;
    }
  ): Promise<EmailSendResult> {
    return this.sendTemplateEmail("notification", to, data, options);
  }

  // Bulk email sending
  async sendBulkNotifications(
    recipients: string[],
    data: TemplateData["notification"]
  ): Promise<Array<{ email: string; result: EmailSendResult }>> {
    const results = await Promise.allSettled(
      recipients.map((email) => this.sendNotificationEmail(email, data))
    );

    return results.map((result, index) => ({
      email: recipients[index],
      result:
        result.status === "fulfilled"
          ? result.value
          : { success: false, error: "Promise rejected" },
    }));
  }

  // Preview email (for development)
  async previewEmail<T extends EmailTemplate>(
    template: T,
    data: TemplateData[T]
  ): Promise<string> {
    return templateRenderer.previewTemplate(template, data);
  }
}

// Create singleton instance
export const emailSender = new EmailSender();