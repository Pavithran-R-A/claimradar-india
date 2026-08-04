export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border bg-surface">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-text-primary">Dashboard</h2>
          <nav className="mt-4 space-y-2">
            <p className="text-sm text-text-muted">Navigation placeholder</p>
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
