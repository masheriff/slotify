// components/admin/users/user-details-content.tsx - User Details Display Component
"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Edit, 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Building,
  UserCheck,
  UserX,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

import { UserDetailsContentProps } from "@/types/user.types";
import { formatProfessionalDetails, formatUserDate, getProfessionalDisplayName, getRoleBadgeClass, getRoleDisplayName, getUserDisplayName, getUserInitials, getUserStatusBadgeClass, getUserStatusText } from "@/lib/utils/user-utils";


export function UserDetailsContent({ 
  user, 
  userId, 
  canEdit = false, 
  canBan = false, 
  canDelete = false 
}: UserDetailsContentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBanUser = async () => {
    // TODO: Implement ban user functionality
    setIsLoading(true);
    try {
      // Call ban user action
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnbanUser = async () => {
    // TODO: Implement unban user functionality
    setIsLoading(true);
    try {
      // Call unban user action
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback className="text-lg">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">{getUserDisplayName(user)}</h1>
              <Badge className={getUserStatusBadgeClass(user)}>
                {getUserStatusText(user)}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
              {user.emailVerified && (
                <UserCheck className="h-4 w-4 text-green-600" />
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created {formatUserDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {canEdit && (
            <Button asChild variant="outline">
              <Link href={`/5am-corp/admin/users/${userId}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Link>
            </Button>
          )}
          
          {canBan && (
            <>
              {user.banned ? (
                <Button 
                  variant="outline" 
                  onClick={handleUnbanUser}
                  disabled={isLoading}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Unban User
                </Button>
              ) : (
                <Button 
                  variant="destructive" 
                  onClick={handleBanUser}
                  disabled={isLoading}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Ban User
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Ban Notice */}
      {user.banned && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-red-800">This user is banned</p>
                {user.banReason && (
                  <p className="text-sm text-red-700">Reason: {user.banReason}</p>
                )}
                {user.banExpires && (
                  <p className="text-sm text-red-700">
                    Expires: {formatUserDate(user.banExpires, true)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organization Memberships */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Organization Memberships</span>
          </CardTitle>
          <CardDescription>
            Organizations this user belongs to and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.memberships.length > 0 ? (
            <div className="space-y-4">
              {user.memberships.map((membership) => (
                <div key={membership.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{membership.organizationName}</h4>
                      <Badge className={getRoleBadgeClass(membership.role as any)}>
                        {getRoleDisplayName(membership.role as any)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Joined {formatUserDate(membership.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={membership.isActive ? "default" : "secondary"}>
                      {membership.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No organization memberships found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Professional Profiles */}
      {(user.technicianProfile || user.interpretingDoctorProfile) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Professional Profile</span>
            </CardTitle>
            <CardDescription>
              Professional details and credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.technicianProfile && (
              <TechnicianProfileSection profile={user.technicianProfile} />
            )}
            
            {user.interpretingDoctorProfile && (
              <InterpretingDoctorProfileSection profile={user.interpretingDoctorProfile} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Account status and verification details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email Verification</label>
                <div className="flex items-center space-x-2 mt-1">
                  {user.emailVerified ? (
                    <>
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Verified</span>
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Not verified</span>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                <div className="mt-1">
                  <Badge className={getUserStatusBadgeClass(user)}>
                    {getUserStatusText(user)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                <p className="text-sm mt-1">{formatUserDate(user.createdAt, true)}</p>
              </div>
              
              {user.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm mt-1">{formatUserDate(user.updatedAt, true)}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Technician Profile Section Component
function TechnicianProfileSection({ profile }: { profile: any }) {
  const details = formatProfessionalDetails(profile, "technician");
  
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="font-medium">{getProfessionalDisplayName(profile)}</h4>
          <p className="text-sm text-muted-foreground">{details.primaryInfo}</p>
          <p className="text-sm text-muted-foreground">{details.secondaryInfo}</p>
        </div>
        
        <Badge variant={profile.isActive ? "default" : "secondary"}>
          {profile.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {profile.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
          )}
          
          {profile.email && (
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profile.email}</span>
            </div>
          )}
          
          {(profile.addressLine1 || profile.city) && (
            <div className="flex items-start space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                {profile.addressLine1 && <div>{profile.addressLine1}</div>}
                {profile.addressLine2 && <div>{profile.addressLine2}</div>}
                {(profile.city || profile.state || profile.code) && (
                  <div>
                    {[profile.city, profile.state, profile.code].filter(Boolean).join(", ")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {details.additionalInfo.map((info, index) => (
            <div key={index} className="text-sm text-muted-foreground">
              {info}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Interpreting Doctor Profile Section Component
function InterpretingDoctorProfileSection({ profile }: { profile: any }) {
  const details = formatProfessionalDetails(profile, "interpreting_doctor");
  
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="font-medium">{getProfessionalDisplayName(profile)}</h4>
          <p className="text-sm text-muted-foreground">{details.primaryInfo}</p>
          <p className="text-sm text-muted-foreground">{details.secondaryInfo}</p>
        </div>
        
        <div className="flex space-x-2">
          <Badge variant={profile.isActive ? "default" : "secondary"}>
            {profile.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="outline">
            {profile.readingStatus}
          </Badge>
        </div>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {profile.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
          )}
          
          {profile.email && (
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profile.email}</span>
            </div>
          )}
          
          {(profile.addressLine1 || profile.city) && (
            <div className="flex items-start space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                {profile.addressLine1 && <div>{profile.addressLine1}</div>}
                {profile.addressLine2 && <div>{profile.addressLine2}</div>}
                {(profile.city || profile.state || profile.code) && (
                  <div>
                    {[profile.city, profile.state, profile.code].filter(Boolean).join(", ")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {details.additionalInfo.map((info, index) => (
            <div key={index} className="text-sm">
              <Badge variant="outline" className="mr-2">
                {info}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}