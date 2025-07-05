// components/profile/name-update-card.tsx
"use client";

import React, { useState, useTransition, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Save, X, User } from 'lucide-react';
import { updateUserName } from '@/actions/profile.actions';
import { toast } from 'sonner';

interface NameUpdateCardProps {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export function NameUpdateCard({ user }: NameUpdateCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentName, setCurrentName] = useState(user.name || '');
  const [tempName, setTempName] = useState(user.name || '');
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setTempName(currentName);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setTempName(currentName);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (tempName.trim() === currentName.trim()) {
      setIsEditing(false);
      return;
    }

    if (!tempName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('name', tempName.trim());

        const result = await updateUserName(formData);

        if (result.success) {
          setCurrentName(tempName.trim());
          setIsEditing(false);
          toast.success('Name updated successfully!');
        } else {
          toast.error(result.error || 'Failed to update name');
        }
      } catch (error) {
        console.error('Name update error:', error);
        toast.error('Failed to update name');
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Display Name
            </CardTitle>
            <CardDescription>
              Your name as it appears throughout the platform
            </CardDescription>
          </div>
          
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEdit}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {!isEditing ? (
          // Display mode
          <div 
            className="flex items-center space-x-3 cursor-pointer group/name p-3 rounded-md hover:bg-muted/50 transition-colors"
            onClick={handleStartEdit}
          >
            <div className="flex-1">
              <p className="font-medium text-lg">
                {currentName || 'No name set'}
              </p>
              <p className="text-sm text-muted-foreground">
                Click to edit your display name
              </p>
            </div>
            <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity" />
          </div>
        ) : (
          // Edit mode
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                ref={inputRef}
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your name"
                disabled={isPending}
                className="flex-1"
                maxLength={100}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSave}
                disabled={isPending || !tempName.trim()}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {isPending ? 'Saving...' : 'Save'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isPending}
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to save, 
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs ml-1">Esc</kbd> to cancel
            </div>
          </div>
        )}

        {/* Character count when editing */}
        {isEditing && (
          <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
            <span>Maximum 100 characters</span>
            <span className={tempName.length > 90 ? 'text-yellow-600' : ''}>
              {tempName.length}/100
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}