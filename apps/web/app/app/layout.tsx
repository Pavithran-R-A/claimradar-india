import { redirect } from 'next/navigation';
import { brandConfig } from '@claimradar/config';
import { requireAppAuth } from '@/lib/app-auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { AppSidebar } from '@/components/app/sidebar';
import { SignOutButton } from '@/components/app/sign-out-button';

interface ProfileRow {
  onboarding_completed: boolean;
  display_name: string | null;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAppAuth();

  const supabase = await getSupabaseServerClient();

  let onboardingCompleted = true;
  let displayName: string | null = null;
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('onboarding_completed, display_name')
    .eq('id', user.id)
    .maybeSingle();
  if (profileRow) {
    const profile = profileRow as unknown as ProfileRow;
    onboardingCompleted = profile.onboarding_completed;
    displayName = profile.display_name;
  }

  if (!onboardingCompleted) {
    redirect('/onboarding');
  }

  let unreadNotifications = 0;
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null);
  unreadNotifications = count ?? 0;

  return (
    <div className="flex min-h-screen min-w-0 overflow-x-clip bg-background">
      <AppSidebar siteName={brandConfig.siteName} unreadNotifications={unreadNotifications} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background-elevated px-4 sm:px-6">
          <p className="truncate text-sm text-text-secondary">
            Signed in as <span className="font-medium text-text-primary">{user.email}</span>
            {displayName ? <span className="text-text-muted"> · {displayName}</span> : null}
          </p>
          <SignOutButton />
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
