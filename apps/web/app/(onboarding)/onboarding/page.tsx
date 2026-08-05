import { requireAppAuth } from '@/lib/app-auth';
import { OnboardingForm } from './onboarding-form';

export default async function OnboardingPage() {
  await requireAppAuth();

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-trust-primary">
          Step 1 of 1 · About 2 minutes
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Tell us what to watch for you
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          A few low-risk answers let our deterministic matching engine compare newly published
          claimables against your history. No documents, no sensitive data — you can change all of
          this later.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
