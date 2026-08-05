import { safeNextPath } from '@/lib/app-auth';
import { LoginForm } from './login-form';

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = safeNextPath(params.next);

  return <LoginForm next={next} />;
}
