// emails/components/email-layout.tsx
import { EmailLayoutProps } from '@/types';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Hr,
  Text,
} from '@react-email/components';



export function EmailLayout({ children, previewText }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      {previewText && (
        <Text style={{ display: 'none', overflow: 'hidden', lineHeight: 1, opacity: 0 }}>
          {previewText}
        </Text>
      )}
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header with Logo */}
          <Section style={headerStyle}>
            <Img
              src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/slotify-logo.png`}
              alt="Slotify"
              width="200"
              height="auto"
              style={logoStyle}
            />
          </Section>

          {/* Main Content */}
          <Section style={contentStyle}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={hrStyle} />
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              © {new Date().getFullYear()} Slotify. All rights reserved.
            </Text>
            <Text style={footerTextStyle}>
              This email was sent from Slotify. If you have any questions, please contact our support team.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const bodyStyle = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: 0,
  padding: 0,
};

const containerStyle = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const headerStyle = {
  backgroundColor: '#ffffff',
  padding: '40px 40px 20px 40px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #f0f0f0',
};

const logoStyle = {
  margin: '0 auto',
  display: 'block',
};

const contentStyle = {
  padding: '40px',
};

const hrStyle = {
  border: 'none',
  borderTop: '1px solid #f0f0f0',
  margin: '0',
};

const footerStyle = {
  backgroundColor: '#f8f9fa',
  padding: '30px 40px',
  textAlign: 'center' as const,
};

const footerTextStyle = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};