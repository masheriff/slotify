// emails/notification.tsx
import {
  Heading,
  Text,
  Button,
  Section,
} from '@react-email/components';
import { EmailLayout } from './components/email-layout';
import { NotificationEmailProps } from '../types/email.types';

export function NotificationEmail({ 
  name, 
  title, 
  message, 
  actionUrl, 
  actionText = 'View Details' 
}: NotificationEmailProps) {
  const previewText = `${title} - Slotify Notification`;
  
  return (
    <EmailLayout previewText={previewText}>
      {/* Personal Greeting */}
      <Text style={greetingStyle}>
        Hi {name},
      </Text>

      {/* Notification Title */}
      <Heading style={headingStyle}>
        📢 {title}
      </Heading>
      
      {/* Notification Content */}
      <Section style={contentSectionStyle}>
        <Text style={messageStyle}>
          {message}
        </Text>
      </Section>

      {/* Action Button (if provided) */}
      {actionUrl && (
        <Section style={buttonSectionStyle}>
          <Button href={actionUrl} style={buttonStyle}>
            {actionText}
          </Button>
        </Section>
      )}

      {/* Additional Info */}
      <Section style={infoSectionStyle}>
        <Text style={infoTextStyle}>
          <strong>When:</strong> {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        <Text style={infoTextStyle}>
          <strong>Notification ID:</strong> #{Math.random().toString(36).substring(2, 15)}
        </Text>
      </Section>

      {/* Manage Notifications */}
      <Section style={manageSectionStyle}>
        <Text style={manageTextStyle}>
          You can manage your notification preferences in your account settings. 
          If you no longer wish to receive these notifications, you can update your preferences anytime.
        </Text>
      </Section>

      {/* Closing */}
      <Text style={closingTextStyle}>
        Best regards,<br />
        The Slotify Team
      </Text>

      {/* Footer Note */}
      <Section style={footerNoteStyle}>
        <Text style={footerNoteTextStyle}>
          This is an automated notification from Slotify. Please do not reply to this email.
        </Text>
      </Section>
    </EmailLayout>
  );
}

// Styles
const greetingStyle = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px 0',
};

const headingStyle = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '32px',
  margin: '0 0 24px 0',
};

const contentSectionStyle = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  borderLeft: '4px solid #ef4444', // Slotify red accent
};

const messageStyle = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  whiteSpace: 'pre-line' as const,
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
  padding: '12px 24px',
  border: 'none',
  cursor: 'pointer',
};

const infoSectionStyle = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const infoTextStyle = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const manageSectionStyle = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fed7aa',
  borderRadius: '8px',
  padding: '20px',
  margin: '32px 0',
};

const manageTextStyle = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const closingTextStyle = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 24px 0',
};

const footerNoteStyle = {
  borderTop: '1px solid #e5e7eb',
  paddingTop: '20px',
  marginTop: '32px',
};

const footerNoteTextStyle = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
  textAlign: 'center' as const,
  fontStyle: 'italic',
};