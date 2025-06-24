// components/ui/file-upload.tsx
"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, File, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface FileUploadProps {
  onUpload: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>
  onDelete?: (url: string) => Promise<{ success: boolean; error?: string }>
  accept?: string
  maxSize?: number // in bytes
  className?: string
  placeholder?: string
  currentFileUrl?: string
  disabled?: boolean
}

export function FileUpload({
  onUpload,
  onDelete,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  className,
  placeholder = "Click to upload or drag and drop",
  currentFileUrl,
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
        toast.success("File uploaded successfully")
      } else {
        toast.error(result.error || "Upload failed")
      }
    } catch (error) {
      toast.error("Upload failed")
    } finally {
      setIsUploading(false)
    }
  }, [onUpload, maxSize])

  const handleFileDelete = useCallback(async () => {
    if (!currentFileUrl || !onDelete) return

    setIsDeleting(true)
    try {
      const result = await onDelete(currentFileUrl)
      if (result.success) {
        toast.success("File deleted successfully")
      } else {
        toast.error(result.error || "Delete failed")
      }
    } catch (error) {
      toast.error("Delete failed")
    } finally {
      setIsDeleting(false)
    }
  }, [currentFileUrl, onDelete])

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

  if (currentFileUrl) {
    return (
      <div className={cn("relative", className)}>
        {/* Current File Display */}
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
          <div className="flex-shrink-0">
            {accept.includes("image") ? (
              <img
                src={currentFileUrl}
                alt="Uploaded file"
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <File className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {currentFileUrl.split('/').pop()}
            </p>
            <p className="text-xs text-muted-foreground">
              Click to replace file
            </p>
          </div>
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleFileDelete}
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