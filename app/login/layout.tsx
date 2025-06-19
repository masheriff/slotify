// app/login/layout.tsx
import { ReCaptchaProvider } from '@/components/providers/recaptcha-provider';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Slotify',
  description: 'Login to your Slotify account',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReCaptchaProvider>{children}</ReCaptchaProvider>;
}
