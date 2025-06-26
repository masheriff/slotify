// components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, LucideIcon } from "lucide-react";
import { useLoadingStore } from "@/stores/loading-store";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  // Loading-related props
  loadingKey?: string;
  loadingText?: string;
  icon?: LucideIcon;
  loadingIcon?: LucideIcon;
  autoGenerateKey?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loadingKey,
      loadingText,
      icon: Icon,
      loadingIcon: LoadingIcon = Loader2,
      autoGenerateKey = true,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    
    // Generate loading key if not provided
    const generatedKey = React.useMemo(() => {
      if (loadingKey) return loadingKey;
      if (!autoGenerateKey) return undefined;
      
      // Generate key from button text or form context
      const buttonText = typeof children === 'string' ? children : '';
      return buttonText.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substr(2, 9);
    }, [loadingKey, autoGenerateKey, children]);
    
    // Subscribe to loading state
    const isLoading = useLoadingStore((state) => 
      generatedKey ? state.isLoading(generatedKey) : false
    );
    const loadingMessage = useLoadingStore((state) =>
      generatedKey ? state.getMessage(generatedKey) : undefined
    );

    // Determine if button should be disabled
    const isDisabled = disabled || isLoading;
    
    // Determine text to show - use loadingMessage from store, fallback to loadingText prop, then to children
    const displayText = isLoading 
      ? (loadingMessage || loadingText || children)
      : children;
    
    // Determine icon to show
    const DisplayIcon = isLoading ? LoadingIcon : Icon;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {DisplayIcon && (
          <DisplayIcon 
            className={cn(
              "h-4 w-4",
              children && "mr-2",
              isLoading && LoadingIcon === Loader2 && "animate-spin"
            )}
          />
        )}
        {displayText}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };