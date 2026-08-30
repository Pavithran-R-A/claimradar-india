import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqAccordion } from '@/components/landing/interactive';

export const metadata: Metadata = {
  title: 'FAQ | ClaimRadar India',
  description:
    'Answers to common questions about ClaimRadar India — how we find opportunities, our independence, data safety, plans, statuses and corrections.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ | ClaimRadar India',
    description:
      'Answers to common questions about ClaimRadar India — how we find opportunities, our independence, data safety, plans, statuses and corrections.',
    url: '/faq',
    type: 'website',
  },
};

const faqItems = [
  {
    question: 'What is ClaimRadar?',
    answer:
      'ClaimRadar is an independent information platform that aggregates publicly available refund, compensation and claim opportunities from official sources in India. We monitor consumer courts, financial regulators, government press releases, company public notices and other official channels to surface opportunities you might otherwise miss. We do not file claims on your behalf.',
  },
  {
    question: 'Is ClaimRadar a government website?',
    answer:
      'No. ClaimRadar is an independent platform. We are not affiliated with the Government of India, any state government, any court, tribunal, regulatory body (RBI, SEBI, IRDAI, etc.), or any listed or private company. We link to official sources so you can verify information yourself.',
  },
  {
    question: 'Does ClaimRadar guarantee I will receive money?',
    answer:
      'No. We surface potential opportunities based on publicly available information. Whether you qualify or receive a refund depends on the specific scheme, your circumstances, the evidence you provide and the official process. We never guarantee outcomes.',
  },
  {
    question: 'How does ClaimRadar find opportunities?',
    answer:
      'We monitor verified official sources across key statutory categories: securities regulators (SEBI), banking authorities (RBI), insolvency boards (IBBI), telecom regulation (TRAI), and government press releases (PIB). Our automated discovery systems extract structured parameters and our human editorial team reviews each candidate record before it goes live.',
  },
  {
    question: 'Is my personal data safe?',
    answer:
      'Yes. We collect minimal data required to operate the platform — your email for account access and alerts, and anonymised usage data for improvements. We do not collect Aadhaar numbers, bank details or other sensitive identifiers. We do not sell your data to third parties. See our Privacy Policy for full details.',
  },
  {
    question: 'What does the free plan include?',
    answer:
      'The free plan gives you access to browse all published claimables, search by company or sector, view deadlines and source links, and set up a basic watchlist for one company with weekly email digests. The core platform is free forever.',
  },
  {
    question: 'What does ClaimRadar Plus include?',
    answer:
      'Plus subscribers get unlimited watchlists, real-time email and push alerts for new opportunities matching their watchlist, priority access to closing-soon alerts, detailed source breakdowns showing extraction confidence, and the ability to export listing data. Plus costs ₹149 per month or ₹999 per year (saving 44%).',
  },
  {
    question: 'How do I report an error or outdated information?',
    answer:
      'Visit our Corrections page or email support@claimradar.in with the listing URL, a description of the error, and a link to the official source if available. Our editorial team reviews all correction requests against the underlying official order.',
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer:
      'Yes. You can cancel your ClaimRadar Plus subscription at any time from your account settings. You will retain access to Plus features until the end of your current billing period. For annual subscriptions, prorated refunds are available within the first 30 days. See our Refund Policy for details.',
  },
  {
    question: 'What are status classifications?',
    answer:
      'Every listing has one of four statuses: Verified (confirmed from authoritative sources like court orders), Open (sourced from official channels like company notices), Under Review (pending editorial sign-off), and Closed (deadline passed or scheme concluded). These statuses help you assess the reliability of each opportunity.',
  },
  {
    question: 'Do you show estimated payout amounts?',
    answer:
      'We only show amounts that are explicitly stated in official source documents. We never invent or estimate refund amounts. If a source document does not specify an amount, we indicate that the amount is "as determined by the authority".',
  },
  {
    question: 'How often is the information updated?',
    answer:
      'Verified listings are re-verified every 7 days. Open listings are re-verified every 14 days. Listings within 7 days of a deadline are re-verified every 48 hours. You can see the "last verified" timestamp on every listing.',
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-base text-text-secondary">
          Everything you need to know about ClaimRadar India.
        </p>
      </header>
      <FaqAccordion items={faqItems} />
      <div className="mt-12 rounded-lg border border-border bg-surface p-8 text-center">
        <h2 className="text-lg font-semibold text-text-primary">Still have questions?</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Our team is here to help. Reach out and we will get back to you within 2 business days.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-flex h-10 items-center rounded-md bg-trust-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-trust-primary-hover"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
