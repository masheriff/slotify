// components/common/not-found.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoadingControl } from "@/lib/with-loading";
import { 
  ArrowLeft, 
  Home, 
  RefreshCcw, 
  Search,
  LucideIcon 
} from "lucide-react";

export interface NotFoundAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  loadingKey?: string;
  loadingText?: string;
}

export interface NotFoundProps {
  /** The type of resource that wasn't found (e.g., "Organization", "User", "Patient") */
  resourceType: string;
  
  /** Custom title for the not found message */
  title?: string;
  
  /** Custom description/message */
  description?: string;
  
  /** Icon to display - defaults to search icon */
  icon?: LucideIcon;
  
  /** Custom actions to display */
  actions?: NotFoundAction[];
  
  /** Show default actions (back, refresh, home) */
  showDefaultActions?: boolean;
  
  /** Back navigation function */
  onBack?: () => void;
  
  /** Refresh/retry function */
  onRefresh?: () => void;
  
  /** Home navigation function */
  onGoHome?: () => void;
  
  /** Additional custom content to render */
  children?: React.ReactNode;
}

export function NotFound({
  resourceType,
  title,
  description,
  icon: Icon = Search,
  actions = [],
  showDefaultActions = true,
  onBack,
  onRefresh,
  onGoHome,
  children,
}: NotFoundProps) {
  const { withLoadingState } = useLoadingControl();

  // Default actions
  const defaultActions: NotFoundAction[] = [];

  if (showDefaultActions) {
    if (onBack) {
      defaultActions.push({
        label: "Go Back",
        onClick: () => withLoadingState(
          'not-found-back',
          async () => onBack(),
          'Going back...'
        ),
        icon: ArrowLeft,
        variant: "outline",
        loadingKey: 'not-found-back',
      });
    }

    if (onRefresh) {
      defaultActions.push({
        label: "Try Again",
        onClick: () => withLoadingState(
          'not-found-refresh',
          async () => onRefresh(),
          'Refreshing...'
        ),
        icon: RefreshCcw,
        variant: "outline",
        loadingKey: 'not-found-refresh',
      });
    }

    if (onGoHome) {
      defaultActions.push({
        label: "Go Home",
        onClick: () => withLoadingState(
          'not-found-home',
          async () => onGoHome(),
          'Going home...'
        ),
        icon: Home,
        variant: "default",
        loadingKey: 'not-found-home',
      });
    }
  }

  // Combine default and custom actions
  const allActions = [...defaultActions, ...actions];

  // Default messages
  const defaultTitle = title || `${resourceType} Not Found`;
  const defaultDescription = description || 
    `The ${resourceType.toLowerCase()} you're looking for doesn't exist or may have been removed.`;

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">{defaultTitle}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            {defaultDescription}
          </p>
          
          {children && (
            <div className="text-center">
              {children}
            </div>
          )}
          
          {allActions.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              {allActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "outline"}
                  onClick={action.onClick}
                  loadingKey={action.loadingKey}
                  loadingText={action.loadingText}
                  icon={action.icon}
                  className="sm:min-w-[120px]"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Specialized NotFound components for common use cases
export function OrganizationNotFound(props: Omit<NotFoundProps, 'resourceType'>) {
  return <NotFound {...props} resourceType="Organization" />;
}

export function UserNotFound(props: Omit<NotFoundProps, 'resourceType'>) {
  return <NotFound {...props} resourceType="User" />;
}

export function PatientNotFound(props: Omit<NotFoundProps, 'resourceType'>) {
  return <NotFound {...props} resourceType="Patient" />;
}

export function BookingNotFound(props: Omit<NotFoundProps, 'resourceType'>) {
  return <NotFound {...props} resourceType="Booking" />;
}

export function AppointmentNotFound(props: Omit<NotFoundProps, 'resourceType'>) {
  return <NotFound {...props} resourceType="Appointment" />;
}