// components/layouts/list-page-wrapper.tsx
"use client"

import { Suspense } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ListPageWrapperProps } from "@/lib/types/list-page"
import { cn } from "@/lib/utils"

/**
 * Loading skeleton for list pages
 */
function ListPageSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      {/* Search and filters skeleton */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
      
      {/* Table skeleton */}
      <Card>
        <CardContent className="p-0">
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Error boundary component for list pages
 */
function ListPageError({ 
  error, 
  onRetry 
}: { 
  error: string
  onRetry?: () => void 
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-destructive">
                Something went wrong
              </h3>
              <p className="text-sm text-muted-foreground">
                {error}
              </p>
            </div>
            {onRetry && (
              <Button 
                onClick={onRetry} 
                variant="outline" 
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Breadcrumb navigation component
 */
function ListPageBreadcrumbs({ 
  breadcrumbs 
}: { 
  breadcrumbs: ListPageWrapperProps['breadcrumbs'] 
}) {
  if (!breadcrumbs || breadcrumbs.length === 0) return null

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <div key={item.label} className="flex items-center">
            <BreadcrumbItem>
              {item.current ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : item.href ? (
                <BreadcrumbLink href={item.href}>
                  {item.label}
                </BreadcrumbLink>
              ) : (
                <span>{item.label}</span>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

/**
 * Main list page wrapper component
 */
export function ListPageWrapper({
  children,
  error,
  loading = false,
  className,
  breadcrumbs,
}: ListPageWrapperProps) {
  // Handle loading state
  if (loading) {
    return <ListPageSkeleton />
  }

  // Handle error state
  if (error) {
    return (
      <div className={cn("flex-1 space-y-4 p-4", className)}>
        <ListPageBreadcrumbs breadcrumbs={breadcrumbs} />
        <ListPageError 
          error={error} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    )
  }

  // Normal render
  return (
    <div className={cn("flex-1 space-y-4 p-4", className)}>
      <ListPageBreadcrumbs breadcrumbs={breadcrumbs} />
      <Suspense fallback={<ListPageSkeleton />}>
        {children}
      </Suspense>
    </div>
  )
}

/**
 * Higher-order component for list pages with error boundary
 */
export function withListPageWrapper<P extends object>(
  Component: React.ComponentType<P>,
  wrapperProps?: Omit<ListPageWrapperProps, 'children'>
) {
  return function WrappedListPage(props: P) {
    return (
      <ListPageWrapper {...wrapperProps}>
        <Component {...props} />
      </ListPageWrapper>
    )
  }
}

/**
 * Alert component for list page warnings
 */
export function ListPageAlert({ 
  type = "warning",
  title,
  message,
  dismissible = false,
  onDismiss,
  className,
}: {
  type?: "warning" | "error" | "info" | "success"
  title: string
  message: string
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}) {
  const variants = {
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-red-200 bg-red-50 text-red-800", 
    info: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-green-200 bg-green-50 text-green-800"
  }

  return (
    <Alert className={cn(variants[type], className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {title}
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-auto p-0 text-current hover:bg-transparent"
          >
            ×
          </Button>
        )}
      </AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

/**
 * Empty state component for list pages
 */
export function ListPageEmptyState({
  title = "No data found",
  description = "There are no items to display.",
  icon: Icon,
  action,
  className,
}: {
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
  className?: string
}) {
  const DefaultIcon = Icon || (() => (
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
      <AlertCircle className="w-8 h-8 text-muted-foreground" />
    </div>
  ))

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      <DefaultIcon className="mb-4" />
      <h3 className="text-lg font-semibold text-center mb-2">{title}</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {description}
      </p>
      {action && (
        <div className="flex flex-col sm:flex-row gap-2">
          {action}
        </div>
      )}
    </div>
  )
}

/**
 * List page header section
 */
export function ListPageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}