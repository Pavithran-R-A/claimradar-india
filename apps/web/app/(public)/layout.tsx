import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

/**
 * Public site shell. The `theme-light` class remaps the semantic colour
 * variables (see app/globals.css) so token-based components render with the
 * light "civic" palette: off-white paper, white cards, teal actions.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-light flex min-h-screen flex-col bg-background text-text-primary">
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
