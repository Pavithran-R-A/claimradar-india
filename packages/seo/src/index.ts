export interface MetadataOptions {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
}

export function generateMetadata(options: MetadataOptions) {
  const { title, description, url, image, type = 'website' } = options;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: image ? [{ url: image }] : [],
      type,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export interface JsonLdOrganization {
  name: string;
  url: string;
  logo?: string;
}

export function buildOrganizationJsonLd(org: JsonLdOrganization) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    logo: org.logo,
  };
}

export interface JsonLdWebSite {
  name: string;
  url: string;
}

export function buildWebSiteJsonLd(site: JsonLdWebSite) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
  };
}

export interface JsonLdWebPage {
  name: string;
  url: string;
  description?: string;
}

export function buildWebPageJsonLd(page: JsonLdWebPage) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.name,
    url: page.url,
    description: page.description,
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbListJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqPageJsonLd(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export interface ArticleData {
  headline: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}

export function buildArticleJsonLd(article: ArticleData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    author: {
      '@type': 'Organization',
      name: article.author,
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified ?? article.datePublished,
    image: article.image,
  };
}

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map((url) => {
      const parts = [`    <loc>${url.loc}</loc>`];
      if (url.lastmod) parts.push(`    <lastmod>${url.lastmod}</lastmod>`);
      if (url.changefreq) parts.push(`    <changefreq>${url.changefreq}</changefreq>`);
      if (url.priority !== undefined) parts.push(`    <priority>${url.priority}</priority>`);
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}
