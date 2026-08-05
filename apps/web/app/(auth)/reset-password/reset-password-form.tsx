'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@claimradar/design-system';
import { updatePassword } from '../actions';

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await updatePassword(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success the server action redirects to /login.
  }

  return (
    <div>
      <h2 className="mb-2 text-center text-xl font-semibold text-text-primary">
        Set a New Password
      </h2>
      <p className="mb-6 text-center text-sm text-text-secondary">
        Choose a strong password of at least 8 characters.
      </p>

      {error && (
        <div className="mb-4 rounded-md border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary"
            placeholder="Repeat your new password"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Updating.' : 'Update Password'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-text-secondary">
        <Link href="/login" className="text-trust-primary hover:underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
