// emails/magic-link.tsx
import {
  Heading,
  Text,
  Button,
  Section,
} from '@react-email/components';
import { EmailLayout } from './components/email-layout';
import { MagicLinkEmailProps } from '../types/email.types';

export function MagicLinkEmail({ 
  email, 
  url,
  expiresIn = '5 minutes'
}: MagicLinkEmailProps) {
  const previewText = 'Your secure login link for Slotify';
  
  return (
    <EmailLayout previewText={previewText}>
      {/* Main Heading */}
      <Heading style={headingStyle}>
        🔐 Your Secure Login Link
      </Heading>
      
      <Text style={textStyle}>
        Click the button below to securely sign in to your Slotify account. No password needed!
      </Text>

      {/* Security Notice */}
      <Section style={securitySectionStyle}>
        <Text style={securityTextStyle}>
          <strong>🛡️ Security Notice</strong>
        </Text>
        <Text style={securityDescriptionStyle}>
          This magic link was requested for <strong>{email}</strong> and will expire in <strong>{expiresIn}</strong>. 
          If you didn't request this link, you can safely ignore this email.
        </Text>
      </Section>

      {/* Magic Link Button */}
      <Section style={buttonSectionStyle}>
        <Button href={url} style={buttonStyle}>
          Sign In to Slotify
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
          {url}
        </Text>
      </Section>

      {/* How it Works */}
      <Section style={infoSectionStyle}>
        <Text style={infoHeaderStyle}>
          🪄 How Magic Links Work
        </Text>
        <ul style={listStyle}>
          <li style={listItemStyle}>Click the button above or use the manual link</li>
          <li style={listItemStyle}>You'll be automatically signed in to Slotify</li>
          <li style={listItemStyle}>No password required - it's that simple!</li>
          <li style={listItemStyle}>The link expires after {expiresIn} for your security</li>
        </ul>
      </Section>

      {/* Expiration Warning */}
      <Section style={warningSectionStyle}>
        <Text style={warningTextStyle}>
          ⏰ <strong>Important:</strong> This link will expire in {expiresIn} and can only be used once. 
          If you need a new link, simply request another one from the login page.
        </Text>
      </Section>

      {/* Support */}
      <Section style={supportSectionStyle}>
        <Text style={supportTextStyle}>
          <strong>Need help?</strong>
        </Text>
        <Text style={supportTextStyle}>
          If you're having trouble signing in or didn't request this link, 
          please contact our support team. We're here to help!
        </Text>
      </Section>

      <Text style={closingTextStyle}>
        Happy to have you back!<br />
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

const securitySectionStyle = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  borderLeft: '4px solid #f59e0b',
};

const securityTextStyle = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '20px',
  margin: '0 0 8px 0',
};

const securityDescriptionStyle = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
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
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const infoHeaderStyle = {
  color: '#1e40af',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '20px',
  margin: '0 0 12px 0',
};

const listStyle = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  paddingLeft: '20px',
};

const listItemStyle = {
  margin: '6px 0',
};

const warningSectionStyle = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const warningTextStyle = {
  color: '#dc2626',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  textAlign: 'center' as const,
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