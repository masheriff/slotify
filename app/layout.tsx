import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalLoadingIndicator } from "@/components/ui/global-loading";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Slotify",
  description: "Appointment scheduling app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Page navigation loading */}
        <NextTopLoader color="#2563eb" height={3} showSpinner={false} />

        {/* Global action loading indicator */}
        <GlobalLoadingIndicator />

        {/* Toast notifications */}
        <Toaster position="top-right"/>
        {children}
      </body>
    </html>
  );
}
