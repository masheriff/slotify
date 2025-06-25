// components/ui/file-upload.tsx
"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, File, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface FileUploadProps {
  onUpload: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>
  onRemove?: (url: string) => Promise<{ success: boolean; error?: string }>
  accept?: string
  maxSize?: number // in bytes
  className?: string
  placeholder?: string
  value?: string // Current file URL/path
  disabled?: boolean
}

export function FileUpload({
  onUpload,
  onRemove,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  className,
  placeholder = "Click to upload or drag and drop",
  value, // This is the current file URL
  disabled = false
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(async (file: File) => {
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    setIsUploading(true)
    try {
      const result = await onUpload(file)
      if (result.success) {
        // Don't show success toast here - let the parent handle it
        // The parent (organization form) already shows success toast
        console.log('File uploaded successfully:', result.url)
      } else {
        toast.error(result.error || "Upload failed")
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("Upload failed")
    } finally {
      setIsUploading(false)
    }
  }, [onUpload, maxSize])

  const handleFileRemove = useCallback(async () => {
    if (!value || !onRemove) return

    setIsDeleting(true)
    try {
      const result = await onRemove(value)
      if (result.success) {
        // Don't show success toast here - let the parent handle it
        console.log('File removed successfully')
      } else {
        toast.error(result.error || "Remove failed")
      }
    } catch (error) {
      console.error('Remove error:', error)
      toast.error("Remove failed")
    } finally {
      setIsDeleting(false)
    }
  }, [value, onRemove])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload, disabled])

  const handleClick = useCallback(() => {
    if (disabled) return
    fileInputRef.current?.click()
  }, [disabled])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [handleFileUpload])

  // Show current file if value exists
  if (value && value.trim() !== '') {
    return (
      <div className={cn("relative", className)}>
        {/* Current File Display */}
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
          <div className="flex-shrink-0">
            {accept.includes("image") ? (
              <img
                src={value}
                alt="Uploaded file"
                className="w-12 h-12 object-cover rounded"
                onError={(e) => {
                  // Fallback to file icon if image fails to load
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <File className={cn(
              "w-12 h-12 text-muted-foreground",
              accept.includes("image") ? "hidden" : ""
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {value.split('/').pop() || 'Uploaded file'}
            </p>
            <p className="text-xs text-muted-foreground">
              Click to replace file
            </p>
          </div>
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleFileRemove}
              disabled={isDeleting || disabled}
              className="flex-shrink-0"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
        
        {/* Hidden input for replacing file */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        
        {/* Clickable overlay for replacing */}
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={handleClick}
        />
      </div>
    )
  }

  // Show upload area if no file
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">
              {isUploading ? "Uploading..." : placeholder}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {accept.includes("image") ? "PNG, JPG, GIF up to " : "Files up to "}
              {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}