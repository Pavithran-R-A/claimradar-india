import { redirect } from 'next/navigation';
import { brandConfig } from '@claimradar/config';
import { getUser } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Onboarding lives outside the (app) shell so the shell's
 * "redirect until onboarding is complete" guard cannot loop.
 */
export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) {
    redirect('/login?next=%2Fonboarding');
  }

  const supabase = await getSupabaseServerClient();
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .maybeSingle();

  if ((profileRow as { onboarding_completed: boolean } | null)?.onboarding_completed) {
    redirect('/app');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background-elevated">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <p className="text-sm font-semibold text-text-primary">{brandConfig.siteName}</p>
          <p className="text-xs text-text-muted">Account setup</p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
