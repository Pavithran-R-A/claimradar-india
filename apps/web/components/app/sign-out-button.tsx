'use client';

import { useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from '@/app/(auth)/actions';

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => signOut())}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
