import type { Metadata } from 'next';
import * as React from 'react';
import { brandConfig } from '@claimradar/config';

interface LegalPageTemplateProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageTemplate({ title, lastUpdated, children }: LegalPageTemplateProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="mb-10 border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-xs font-medium text-text-muted">Last updated: {lastUpdated}</p>
      </header>
      <div className="space-y-6 text-sm leading-relaxed text-text-secondary [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-text-primary [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-text-primary [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_p]:leading-relaxed">
        {children}
      </div>
    </article>
  );
}

export function generateLegacyLegalMetadata(title: string, description: string): Metadata {
  return {
    title: `${title} — ${brandConfig.siteName}`,
    description,
  };
}

export function generateLegalMetadata(title: string, description: string): Metadata {
  return {
    title: `${title} — ${brandConfig.siteName}`,
    description,
  };
}
