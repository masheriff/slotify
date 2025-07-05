import { Heading, Text, Section } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";
import { OTPVerificationEmailProps } from "@/types";

export function OTPVerificationEmail({
  //   email,
  otp,
  expiresIn = "5 minutes",
}: OTPVerificationEmailProps) {
  return (
    <EmailLayout previewText={`Your verification code: ${otp}`}>
      <Heading>Verify Your Email Change</Heading>
      <Text>Enter this code to complete your email change:</Text>

      {/* <Section style={otpCodeStyle}>
        <Text style={otpTextStyle}>{otp}</Text>
      </Section> */}

      <Section>
        <Text>{otp}</Text>
      </Section>

      <Text>This code expires in {expiresIn}.</Text>
      <Text>If you didn't request this change, please ignore this email.</Text>
    </EmailLayout>
  );
}
