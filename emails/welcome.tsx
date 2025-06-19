// emails/welcome.tsx
import {
  Heading,
  Text,
  Button,
  Section,
} from '@react-email/components';
import { EmailLayout } from './components/email-layout';
import { WelcomeEmailProps } from '../types/email.types';

export function WelcomeEmail({ 
  name, 
  email, 
  loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login` 
}: WelcomeEmailProps) {
  const previewText = `Welcome to Slotify, ${name}! Your account is ready.`;
  
  return (
    <EmailLayout previewText={previewText}>
      {/* Main Greeting */}
      <Heading style={headingStyle}>
        Welcome to Slotify, {name}! 🎉
      </Heading>
      
      <Text style={textStyle}>
        We're thrilled to have you join the Slotify community! Your account has been successfully created and is ready to use.
      </Text>

      {/* Account Details */}
      <Section style={infoBoxStyle}>
        <Text style={infoTextStyle}>
          <strong>Your account email:</strong> {email}
        </Text>
        <Text style={infoTextStyle}>
          <strong>Account status:</strong> Active ✅
        </Text>
      </Section>

      {/* Getting Started */}
      <Heading style={subHeadingStyle}>
        Get Started with Slotify
      </Heading>
      
      <Text style={textStyle}>
        Here's what you can do next:
      </Text>
      
      <ul style={listStyle}>
        <li style={listItemStyle}>Explore your dashboard and customize your profile</li>
        <li style={listItemStyle}>Set up your preferences and notifications</li>
        <li style={listItemStyle}>Start using Slotify's powerful features</li>
        <li style={listItemStyle}>Join our community and connect with other users</li>
      </ul>

      {/* CTA Button */}
      <Section style={buttonSectionStyle}>
        <Button href={loginUrl} style={buttonStyle}>
          Access Your Account
        </Button>
      </Section>

      {/* Support Info */}
      <Section style={supportSectionStyle}>
        <Text style={supportTextStyle}>
          <strong>Need help getting started?</strong>
        </Text>
        <Text style={supportTextStyle}>
          Our support team is here to help! Feel free to reach out if you have any questions or need assistance.
        </Text>
      </Section>

      <Text style={closingTextStyle}>
        Welcome aboard!<br />
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

const subHeadingStyle = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '32px 0 16px 0',
};

const textStyle = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const infoBoxStyle = {
  backgroundColor: '#f3f4f6',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const infoTextStyle = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const listStyle = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  paddingLeft: '20px',
};

const listItemStyle = {
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
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  border: 'none',
  cursor: 'pointer',
};

const supportSectionStyle = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
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
  fontWeight: '500',
};