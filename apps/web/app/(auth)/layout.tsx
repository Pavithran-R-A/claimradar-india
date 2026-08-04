export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-text-primary">ClaimRadar</h1>
          <p className="mt-1 text-sm text-text-secondary">India</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-8 shadow-lg">{children}</div>
      </div>
    </div>
  );
}
