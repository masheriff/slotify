// components/profile/image-cropper-modal.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Cropper } from "@origin-space/image-cropper"

interface ImageCropperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropComplete: (croppedImageUrl: string) => void;
}

type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
} | null;

export function ImageCropperModal({ open, onOpenChange, onCropComplete }: ImageCropperModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropData, setCropData] = useState<CropArea>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setOriginalFile(file);
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setCropData(null);

    // Reset file input
    event.target.value = '';
  }, []);

  const cropImageToCanvas = useCallback((
    image: HTMLImageElement,
    crop: CropArea
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!crop) {
        reject(new Error('No crop data'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas size to 300x300 (our target profile picture size)
      const targetSize = 300;
      canvas.width = targetSize;
      canvas.height = targetSize;

      // Calculate scale factors
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Draw the cropped and resized image
      ctx.drawImage(
        image,
        crop.x * scaleX, // Source x
        crop.y * scaleY, // Source y
        crop.width * scaleX, // Source width
        crop.height * scaleY, // Source height
        0, // Destination x
        0, // Destination y
        targetSize, // Destination width
        targetSize // Destination height
      );

      // Convert to PNG blob with quality optimization
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to blob conversion failed'));
          }
        },
        'image/png',
        0.9 // High quality for PNG
      );
    });
  }, []);

  const handleCropAndUpload = useCallback(async () => {
    if (!selectedImage || !cropData || !originalFile) {
      toast.error('Please select and crop an image first');
      return;
    }

    setIsUploading(true);

    try {
      // Create image element to get natural dimensions
      const image = new Image();
      
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = selectedImage;
      });

      // Crop the image to canvas and get blob
      const croppedBlob = await cropImageToCanvas(image, cropData);

      // Check final file size (should be under 500KB)
      if (croppedBlob.size > 500 * 1024) {
        toast.error('Cropped image is too large. Please try a different crop area.');
        return;
      }

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', croppedBlob, `profile-${Date.now()}.png`);

      // Upload to server
      const response = await fetch('/api/upload/profile', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onCropComplete(result.url);
        toast.success('Profile picture updated successfully!');
        handleClose();
      } else {
        toast.error(result.error || 'Upload failed');
      }

    } catch (error) {
      console.error('Crop and upload error:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [selectedImage, cropData, originalFile, onCropComplete]);

  const handleClose = useCallback(() => {
    setSelectedImage(null);
    setCropData(null);
    setOriginalFile(null);
    setIsUploading(false);
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedImage ? (
            // File selection area
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Select an image to crop for your profile picture
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="mt-4"
                >
                  Choose Image
                </Button>
              </div>
            </div>
          ) : (
            // Image cropper area
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Drag to move, scroll to zoom. Image will be cropped to a square.
                </p>
              </div>
              
              <div className="flex justify-center">
                <Cropper.Root
                  image={selectedImage}
                  aspectRatio={1} // 1:1 ratio for profile pictures
                  onCropChange={setCropData}
                  className="relative flex h-80 w-80 cursor-move touch-none items-center justify-center overflow-hidden rounded-md border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Cropper.Description className="sr-only">
                    Crop your profile picture by dragging to move and scrolling to zoom
                  </Cropper.Description>
                  <Cropper.Image className="pointer-events-none h-full w-full select-none object-cover" />
                  <Cropper.CropArea className="pointer-events-none absolute border-2 border-dashed border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]" />
                </Cropper.Root>
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedImage(null);
                    setCropData(null);
                  }}
                  disabled={isUploading}
                >
                  Choose Different Image
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          
          {selectedImage && (
            <Button
              onClick={handleCropAndUpload}
              disabled={!cropData || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Save Profile Picture'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}