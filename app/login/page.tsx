// app/login/page.tsx
import { LoginForm } from "@/components/form/login/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { TermsFooter } from "@/components/terms-footer";

export default function LoginPage() {
  return (
    <main className="relative flex justify-center items-center min-h-screen">
      {/* Seamless background for mobile */}
      <div 
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/blur-hospital.webp)'
        }}
      />
      
      <div>
        <Card className="bg-white shadow-lg w-[400px] mx-4">
          <CardHeader>
            <CardTitle className="flex flex-col items-center">
              <Image
                src="/slotify-logo.svg"
                alt="slotify-logo"
                width={200}
                height={100}
              />
            </CardTitle>
            <CardDescription className="text-center text-gray-600 mb-4">
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
        
        {/* Terms Footer Component */}
        <TermsFooter />
      </div>

      {/* Redesigned Footer */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col items-center space-y-3">
            {/* Powered by section */}
            <div className="flex items-center space-x-4">
              <Image
                src="/5amcorp-logo.svg"
                alt="5AM Corp"
                width={60}
                height={30}
                className="object-contain"
              />
              {/* Vertical line */}
              <div className="h-12 w-px bg-black"></div>
              <span className="font-bold">
                Powered by <br />
                <Link
                  className="text-red-600 hover:text-red-700 underline transition-colors"
                  href="https://5amcorp.com"
                  target="_blank"
                >
                  5 AM Corporation
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}