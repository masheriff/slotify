// components/dialogs/ban-user-dialog.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { banFormSchema, type BanFormInput } from "@/schemas/users.schemas";
import { banUser } from "@/actions/users.actions";
import { toast } from "sonner";
import { formatUserDisplayName } from "@/utils/users.utils";
import type { BanUserDialogProps } from "@/types/users.types";
import { getErrorMessage } from "@/types";

export function BanUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: BanUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BanFormInput>({
    resolver: zodResolver(banFormSchema),
    defaultValues: {
      banReason: "",
      banExpires: undefined,
    },
  });

  const handleSubmit = async (data: BanFormInput) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("id", user.id);
      formData.append("banReason", data.banReason);
      if (data.banExpires) {
        formData.append("banExpires", data.banExpires.toISOString());
      }

      const result = await banUser(formData);

      if (result.success) {
        toast.success(result.message || "User banned successfully");
        onOpenChange(false);
        form.reset();
        onSuccess?.();
      } else {
        toast.error(getErrorMessage(result.error || "Failed to ban user"));
      }
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            You are about to ban{" "}
            <span className="font-semibold">
              {formatUserDisplayName(user)}
            </span>
            . This action will prevent them from accessing the system.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="banReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ban Reason *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide a detailed reason for banning this user..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="banExpires"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ban Expiration (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select expiration date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date <= new Date() || date < new Date("1900-01-01")
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground">
                    Leave empty for permanent ban
                  </p>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isLoading}
              >
                {isLoading ? "Banning..." : "Ban User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}