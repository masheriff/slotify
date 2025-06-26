// components/common/details-page-header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft, LucideIcon } from "lucide-react";

export interface DetailsPageHeaderAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  loadingKey?: string;
  loadingText?: string;
}

export interface DetailsPageHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: {
    src?: string;
    fallback: string;
  };
  badges?: Array<{
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
    color?: string;
  }>;
  breadcrumbItems: Array<{
    title: string;
    href?: string;
  }>;
  actions?: DetailsPageHeaderAction[];
  onBack?: () => void;
  backLabel?: string;
}

export function DetailsPageHeader({
  title,
  subtitle,
  avatar,
  badges = [],
  breadcrumbItems,
  actions = [],
  onBack,
}: DetailsPageHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Header with back button, title, and actions */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <SidebarTrigger className="-ml-1" />
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="h-8 w-8 p-0"
                loadingKey="details-back-navigation"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            {/* Avatar and title */}
            <div className="flex items-center space-x-3">
              {avatar && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatar.src} alt={title} />
                  <AvatarFallback className="text-sm">
                    {avatar.fallback}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Breadcrumbs */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbItems.map((item, index) => (
                <BreadcrumbSeparator key={`sep-${index}`} />
              ))}
              {breadcrumbItems.map((item, index) => (
                <BreadcrumbItem key={index}>
                  {item.href ? (
                    <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.title}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        {/* Action buttons */}
        {actions.length > 0 && (
          <div className="flex items-center space-x-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "default"}
                onClick={action.onClick}
                loadingKey={action.loadingKey}
                loadingText={action.loadingText}
                icon={action.icon}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex items-center space-x-2">
          {badges.map((badge, index) => (
            <Badge
              key={index}
              variant={badge.variant || "default"}
              className={badge.color}
            >
              {badge.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}