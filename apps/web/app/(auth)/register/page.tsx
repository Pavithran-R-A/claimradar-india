'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@claimradar/design-system';
import { signUp } from '../actions';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.message) {
      setSuccess(result.message);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-4 rounded-md border border-trust-primary/20 bg-trust-primary/10 p-4">
          <p className="text-sm text-text-primary">{success}</p>
        </div>
        <Link href="/login" className="text-sm text-trust-primary hover:underline">
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-center text-xl font-semibold text-text-primary">Create Account</h2>

      {error && (
        <div className="mb-4 rounded-md border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-secondary">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            Password
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
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary"
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-trust-primary underline hover:text-trust-primary-hover"
        >
          Sign in
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-text-muted">
        By creating an account, you agree to our{' '}
        <Link
          href="/terms"
          className="font-medium underline text-text-secondary hover:text-text-primary"
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href="/privacy"
          className="font-medium underline text-text-secondary hover:text-text-primary"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
