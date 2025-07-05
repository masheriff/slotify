// components/profile/profile-picture-card.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';
import { ImageCropperModal } from './image-cropper-modal';
import { updateUserProfilePicture } from '@/actions/profile.actions';
import { toast } from 'sonner';
import { User } from 'better-auth';

interface ProfilePictureCardProps {
  user: User
}

export function ProfilePictureCard({ user }: ProfilePictureCardProps) {
  const [cropperOpen, setCropperOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(user.image);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCropComplete = async (newImageUrl: string) => {
    setIsUpdating(true);

    try {
      const result = await updateUserProfilePicture(newImageUrl, currentImage || null);
      
      if (result.success) {
        setCurrentImage(newImageUrl);
        toast.success('Profile picture updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Profile picture update error:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setIsUpdating(false);
    }
  };

  const getUserInitials = () => {
    if (user.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email[0].toUpperCase();
  };

  return (
    <>
      <Card className="group cursor-pointer transition-all hover:shadow-md">
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Upload a new profile picture. Image will be cropped to a square.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {/* Avatar with hover effect */}
            <div 
              className="relative"
              onClick={() => setCropperOpen(true)}
            >
              <Avatar className="h-20 w-20 transition-all group-hover:ring-2 group-hover:ring-primary group-hover:ring-offset-2">
                <AvatarImage 
                  src={currentImage || ''} 
                  alt={user.name || 'Profile picture'} 
                />
                <AvatarFallback className="text-lg">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1">
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {currentImage ? 'Current picture' : 'No picture set'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Click on the avatar or button below to change your picture
                </p>
              </div>
              
              <Button
                onClick={() => setCropperOpen(true)}
                variant="outline"
                size="sm"
                className="mt-3"
                disabled={isUpdating}
              >
                <Upload className="mr-2 h-4 w-4" />
                {currentImage ? 'Change Picture' : 'Upload Picture'}
              </Button>
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground">
              <strong>Requirements:</strong> PNG, JPG, or GIF up to 5MB. 
              Image will be automatically resized to 300x300 pixels.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        onCropComplete={handleCropComplete}
      />
    </>
  );
}