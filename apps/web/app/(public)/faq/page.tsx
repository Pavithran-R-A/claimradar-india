import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqAccordion } from '@/components/landing/interactive';

export const metadata: Metadata = {
  title: 'FAQ | ClaimKhoj India',
  description:
    'Answers to common questions about ClaimKhoj India — how we find opportunities, our independence, data safety, plans, statuses and corrections.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ | ClaimKhoj India',
    description:
      'Answers to common questions about ClaimKhoj India — how we find opportunities, our independence, data safety, plans, statuses and corrections.',
    url: '/faq',
    type: 'website',
  },
};

const faqItems = [
  {
    question: 'What is ClaimKhoj?',
    answer:
      'ClaimKhoj is an independent information platform that aggregates publicly available refund, compensation and claim opportunities from official sources in India. We monitor financial regulators, insolvency authorities, telecom regulators, and government press releases to surface opportunities you might otherwise miss. We do not file claims on your behalf.',
  },
  {
    question: 'Is ClaimKhoj a government website?',
    answer:
      'No. ClaimKhoj is an independent platform. We are not affiliated with the Government of India, any state government, any court, tribunal, regulatory body (RBI, SEBI, IRDAI, etc.), or any listed or private company. We link to official sources so you can verify information yourself.',
  },
  {
    question: 'Does ClaimKhoj guarantee I will receive money?',
    answer:
      'No. We surface potential opportunities based on publicly available information. Whether you qualify or receive a refund depends on the specific scheme, your circumstances, the evidence you provide and the official process. We never guarantee outcomes.',
  },
  {
    question: 'How does ClaimKhoj find opportunities?',
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
      'You can explore official recovery routes, source notices, and any independently verified claimable listings for free. Account features such as watchlists may be available, but automated outbound email alerts are not currently offered.',
  },
  {
    question: 'What does ClaimKhoj Plus include?',
    answer:
      'ClaimKhoj Plus is not currently available to purchase. The service is free during beta. Paid subscriptions, checkout and paid alert services are disabled; any future offering will be disclosed before taking payment.',
  },
  {
    question: 'How do I report an error or outdated information?',
    answer:
      'Our Corrections page explains source verification and retraction, but a direct submission channel is not currently configured. See the Contact page for available channels. For filing or deadline questions, use the linked official authority.',
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer:
      'ClaimKhoj is not accepting paid subscriptions, so there is no current paid ClaimKhoj plan to cancel. If billing is introduced later, cancellation and refund terms will be published before checkout.',
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
          Everything you need to know about ClaimKhoj India.
        </p>
      </header>
      <FaqAccordion items={faqItems} />
      <div className="mt-12 rounded-lg border border-border bg-surface p-8 text-center">
        <h2 className="text-lg font-semibold text-text-primary">Still have questions?</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Our contact page lists the currently available channels. Direct platform support is not
          yet configured; for a specific claim, contact the linked official authority.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-flex items-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90"
        >
          View contact information
        </Link>
      </div>
    </div>
  );
}
