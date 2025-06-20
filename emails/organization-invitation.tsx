// emails/organization-invitation.tsx
import {
  Heading,
  Text,
  Button,
  Section,
} from '@react-email/components';
import { EmailLayout } from './components/email-layout';

export interface OrganizationInvitationEmailProps {
  email: string;
  organizationName: string;
  inviterName: string;
  invitationLink: string;
  expiresIn?: string;
}

export function OrganizationInvitationEmail({ 
  email,
  organizationName,
  inviterName,
  invitationLink,
  expiresIn = '7 days'
}: OrganizationInvitationEmailProps) {
  const previewText = `You've been invited to join ${organizationName} on Slotify`;
  
  return (
    <EmailLayout previewText={previewText}>
      {/* Main Heading */}
      <Heading style={headingStyle}>
        🎉 You're Invited to Join {organizationName}
      </Heading>
      
      <Text style={textStyle}>
        <strong>{inviterName}</strong> has invited you to join <strong>{organizationName}</strong> on Slotify, 
        our healthcare scheduling platform.
      </Text>

      {/* Invitation Details */}
      <Section style={invitationSectionStyle}>
        <Text style={invitationTextStyle}>
          <strong>📧 Invited Email:</strong> {email}
        </Text>
        <Text style={invitationTextStyle}>
          <strong>🏥 Organization:</strong> {organizationName}
        </Text>
        <Text style={invitationTextStyle}>
          <strong>👤 Invited By:</strong> {inviterName}
        </Text>
        <Text style={invitationTextStyle}>
          <strong>⏰ Expires In:</strong> {expiresIn}
        </Text>
      </Section>

      {/* Accept Invitation Button */}
      <Section style={buttonSectionStyle}>
        <Button href={invitationLink} style={buttonStyle}>
          Accept Invitation & Join {organizationName}
        </Button>
      </Section>

      {/* Manual Link */}
      <Section style={manualLinkSectionStyle}>
        <Text style={manualLinkTextStyle}>
          <strong>Having trouble with the button?</strong>
        </Text>
        <Text style={manualLinkTextStyle}>
          Copy and paste this link into your browser:
        </Text>
        <Text style={linkTextStyle}>
          {invitationLink}
        </Text>
      </Section>

      {/* What Happens Next */}
      <Section style={infoSectionStyle}>
        <Text style={infoHeaderStyle}>
          🚀 What Happens Next
        </Text>
        <ul style={listStyle}>
          <li style={listItemStyle}>Click the invitation link above</li>
          <li style={listItemStyle}>You'll be automatically signed in to Slotify</li>
          <li style={listItemStyle}>Complete your profile setup</li>
          <li style={listItemStyle}>Start collaborating with your team on {organizationName}</li>
        </ul>
      </Section>

      {/* Security Notice */}
      <Section style={securitySectionStyle}>
        <Text style={securityTextStyle}>
          🔒 <strong>Security Notice:</strong> This invitation link is unique to your email address 
          and will expire in {expiresIn}. If you didn't expect this invitation, you can safely ignore this email.
        </Text>
      </Section>

      {/* About Slotify */}
      <Section style={aboutSectionStyle}>
        <Text style={aboutHeaderStyle}>
          🏥 About Slotify
        </Text>
        <Text style={aboutTextStyle}>
          Slotify is a HIPAA-compliant healthcare scheduling platform designed to streamline 
          appointment management, patient scheduling, and healthcare workflow coordination.
        </Text>
      </Section>

      {/* Support */}
      <Section style={supportSectionStyle}>
        <Text style={supportTextStyle}>
          <strong>Need help?</strong>
        </Text>
        <Text style={supportTextStyle}>
          If you have any questions about this invitation or need assistance getting started, 
          please contact our support team.
        </Text>
      </Section>

      <Text style={closingTextStyle}>
        Welcome to the team!<br />
        The Slotify Team
      </Text>
    </EmailLayout>
  );
}

// Styles
const headingStyle = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const textStyle = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const invitationSectionStyle = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  borderLeft: '4px solid #0ea5e9',
};

const invitationTextStyle = {
  color: '#0c4a6e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const buttonSectionStyle = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const buttonStyle = {
  backgroundColor: '#ef4444', // Slotify red color
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)',
};

const manualLinkSectionStyle = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const manualLinkTextStyle = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const linkTextStyle = {
  color: '#3b82f6',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '12px 0',
  wordBreak: 'break-all' as const,
  padding: '8px',
  backgroundColor: '#f3f4f6',
  borderRadius: '4px',
  fontFamily: 'monospace',
};

const infoSectionStyle = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const infoHeaderStyle = {
  color: '#15803d',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '20px',
  margin: '0 0 12px 0',
};

const listStyle = {
  color: '#15803d',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  paddingLeft: '20px',
};

const listItemStyle = {
  margin: '6px 0',
};

const securitySectionStyle = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fed7aa',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const securityTextStyle = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  textAlign: 'center' as const,
};

const aboutSectionStyle = {
  backgroundColor: '#fefefe',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const aboutHeaderStyle = {
  color: '#374151',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '20px',
  margin: '0 0 12px 0',
};

const aboutTextStyle = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const supportSectionStyle = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '32px 0',
};

const supportTextStyle = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const closingTextStyle = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 0 0',
  textAlign: 'center' as const,
  fontWeight: '500',
};