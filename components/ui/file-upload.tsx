// Fix for components/ui/file-upload.tsx

"use client"

import { useState, useRef, useCallback, useEffect } from "react"
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
  const [uploadTimeout, setUploadTimeout] = useState<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (uploadTimeout) {
        clearTimeout(uploadTimeout)
      }
    }
  }, [uploadTimeout])

  const handleFileUpload = useCallback(async (file: File) => {
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    console.log(`Starting upload for ${file.name}, type: ${file.type}`)
    setIsUploading(true)
    
    // Set a timeout to prevent infinite loops
    const timeout = setTimeout(() => {
      if (isUploading) {
        console.warn("Upload timeout reached - preventing infinite loop")
        setIsUploading(false)
        toast.error("Upload timed out. Please try again.")
      }
    }, 30000) // 30 second timeout
    
    setUploadTimeout(timeout)
    
    try {
      const result = await onUpload(file)
      // Clear the timeout since we got a response
      clearTimeout(timeout)
      setUploadTimeout(null)
      
      if (result.success) {
        console.log('File uploaded successfully:', result.url)
      } else {
        console.error('Upload failed:', result.error)
        toast.error(result.error || "Upload failed")
      }
    } catch (error) {
      // Clear the timeout since we got an error
      clearTimeout(timeout)
      setUploadTimeout(null)
      
      console.error('Upload error:', error)
      toast.error("Upload failed")
    } finally {
      setIsUploading(false)
    }
  }, [onUpload, maxSize, isUploading])

  const handleFileRemove = useCallback(async () => {
    if (!value || !onRemove) return

    setIsDeleting(true)
    try {
      const result = await onRemove(value)
      if (result.success) {
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

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && !disabled && !isUploading) {
      handleFileUpload(files[0])
    }
  }, [disabled, isUploading, handleFileUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && !disabled && !isUploading) {
      handleFileUpload(files[0])
      
      // Reset the input value so the same file can be selected again if needed
      e.target.value = ''
    }
  }, [disabled, isUploading, handleFileUpload])

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled, isUploading])

  // If we have a value (file is uploaded), show the file info with remove button
  if (value && !isUploading) {
    const fileName = value.split('/').pop() || 'Uploaded file'
    const isImage = accept.includes('image')
    
    return (
      <div className={cn("flex items-center gap-2 p-3 border rounded-lg bg-muted/50", className)}>
        {isImage ? (
          <img 
            src={value} 
            alt={fileName}
            className="h-8 w-auto object-contain shrink-0 rounded"
            onError={(e) => {
              // Handle image load errors
              console.error('Image failed to load:', value)
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-image.png' // Fallback image
            }}
          />
        ) : (
          <File className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className="text-sm truncate flex-1">{fileName}</span>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleFileRemove}
            disabled={isDeleting || disabled}
            className="shrink-0"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    )
  }

  // Upload area when no file is uploaded or during upload
  return (
    <div className={cn("relative", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="sr-only"
        disabled={disabled || isUploading}
      />
      
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
          isDragging && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          !isDragging && !disabled && "hover:border-primary/50",
          className
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">{placeholder}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Max size: {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </>
        )}
      </div>
    </div>
  )
}