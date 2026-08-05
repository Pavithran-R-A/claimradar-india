import { ForgotPasswordForm } from './forgot-password-form';

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  return (
    <ForgotPasswordForm
      linkExpired={params.error === 'link_expired'}
      linkInvalid={params.error === 'link_invalid'}
    />
  );
}
