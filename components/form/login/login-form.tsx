//components/form/login/login-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Mail, AlertCircle, CheckCircle, Send } from "lucide-react";
import { sendMagicLinkAction, type MagicLinkSignInInput } from "@/actions/login-actions";
import { useLoadingControl } from "@/lib/with-loading";

// Zod schema for form validation (client-side)
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LOADING_KEY = "magic-link-login";

export function LoginForm() {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { executeRecaptcha } = useGoogleReCaptcha();
  const { withLoadingState, isLoading } = useLoadingControl();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!executeRecaptcha) {
      setMessage({
        type: "error",
        text: "reCAPTCHA not ready. Please try again.",
      });
      return;
    }

    setMessage(null);

    try {
      await withLoadingState(
        LOADING_KEY,
        async () => {
          // Execute reCAPTCHA
          const recaptchaToken = await executeRecaptcha("magic_link_login");
          
          if (!recaptchaToken) {
            throw new Error("reCAPTCHA verification failed");
          }

          // Prepare data for server action
          const actionData: MagicLinkSignInInput = {
            email: data.email,
            recaptchaToken,
          };

          // Call the server action
          const result = await sendMagicLinkAction(actionData);
          
          if (result.success) {
            setMessage({
              type: "success",
              text: result.message!,
            });
            form.reset(); // Clear the form
          } else {
            // Handle server-side validation or API errors
            if (result.error) {
              if (typeof result.error === 'object' && 'general' in result.error) {
                // General error from API
                setMessage({
                  type: "error",
                  text: result.error.general,
                });
              } else {
                // Field validation errors
                Object.entries(result.error).forEach(([key, value]) => {
                  if (key === 'email' && Array.isArray(value)) {
                    form.setError('email', {
                      type: "server",
                      message: value.join(", "),
                    });
                  }
                });
              }
            } else {
              setMessage({
                type: "error",
                text: "An unexpected error occurred. Please try again.",
              });
            }
          }
        },
        "Sending Magic Link..."
      );
    } catch (error) {
      console.error("Login error:", error);
      setMessage({
        type: "error",
        text: error instanceof Error 
          ? error.message 
          : "Failed to send magic link. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {message && (
        <Alert className={message.type === "error" ? "border-red-500" : "border-green-500"}>
          {message.type === "error" ? (
            <AlertCircle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-800" />
          )}
          <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="m@example.com"
                    disabled={isLoading(LOADING_KEY)}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full"
            loadingKey={LOADING_KEY}
            icon={Send}
          >
            Login
          </Button>
        </form>
      </Form>
    </div>
  );
}