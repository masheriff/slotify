// types/email.types.ts
export interface WelcomeEmailProps {
  name: string;
  email: string;
  loginUrl?: string;
}

export interface NotificationEmailProps {
  name: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

export interface MagicLinkEmailProps {
  email: string;
  url: string;
  expiresIn?: string;
}

export interface OrganizationInvitationEmailProps {
  email: string;
  organizationName: string;
  inviterName: string;
  invitationLink: string;
  expiresIn?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface TemplateData {
  welcome: WelcomeEmailProps;
  notification: NotificationEmailProps;
  "magic-link": MagicLinkEmailProps;
  "organization-invitation": OrganizationInvitationEmailProps;
}

export interface EmailLayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

export interface OrganizationInvitationEmailProps {
  email: string;
  organizationName: string;
  inviterName: string;
  invitationLink: string;
  expiresIn?: string;
}
