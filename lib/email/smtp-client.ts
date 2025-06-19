// lib/email/smtp-client.ts
import nodemailer from 'nodemailer';
import { SMTPConfig } from '../../types/email.types';

class SMTPClient {
  private transporter: nodemailer.Transporter | null = null;
  private config: SMTPConfig | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const config: SMTPConfig = {
      host: process.env.SMTP_HOST!,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASSWORD!,
      },
    };

    if (!config.host || !config.auth.user || !config.auth.pass) {
      throw new Error('SMTP configuration is incomplete. Please check your environment variables.');
    }

    this.config = config;
    this.transporter = nodemailer.createTransport(config);
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return false;
    }
  }

  async sendMail(options: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    cc?: string | string[];
    bcc?: string | string[];
  }) {
    if (!this.transporter) {
      throw new Error('SMTP client not initialized');
    }

    const fromEmail = options.from || process.env.SMTP_FROM_EMAIL || this.config?.auth.user;
    const fromName = process.env.SMTP_FROM_NAME || 'Slotify';

    try {
      const result = await this.transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        html: options.html,
      });

      console.log('Email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  getConfig() {
    return this.config;
  }
}

// Create singleton instance
export const smtpClient = new SMTPClient();