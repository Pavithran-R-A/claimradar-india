import type { Metadata } from 'next';

interface LegalPageTemplateProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

// LEGAL_COUNSEL_REVIEW_REQUIRED_BEFORE_COMMERCIAL_LAUNCH

export function LegalPageTemplate({ title, lastUpdated, children }: LegalPageTemplateProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-text-muted">Last updated: {lastUpdated}</p>
      </header>
      <div className="prose-invert space-y-8 text-sm leading-relaxed text-text-secondary [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text-primary [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-text-primary [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_p]:leading-relaxed">
        {children}
      </div>
    </article>
  );
}

export function generateLegalMetadata(title: string, description: string): Metadata {
  return {
    title: `${title} — ClaimRadar India`,
    description,
  };
}
