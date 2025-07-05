// app/[orgSlug]/my/profile/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProfilePictureCard } from '@/components/profile/profile-picture-card';
import { NameUpdateCard } from '@/components/profile/name-update-card';
import { headers } from 'next/headers';

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile information and settings
          </p>
        </div>

        {/* Profile Picture Section */}
        <ProfilePictureCard user={session.user} />

        {/* Name Update Section */}
        <NameUpdateCard user={session.user} />

        {/* Account Security Info */}
        <div className="border rounded-lg p-6 bg-muted/30">
          <h3 className="font-medium flex items-center gap-2">
            🛡️ Account Security
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Your profile information is protected with industry-standard security measures. 
            Email changes require verification to ensure account safety.
          </p>
        </div>
      </div>
    </div>
  );
}