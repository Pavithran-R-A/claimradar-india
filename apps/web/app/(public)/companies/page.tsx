import { ComingSoon, generateComingSoonMetadata } from '@/components/coming-soon';

export const metadata = generateComingSoonMetadata(
  'Company Directory',
  'Browse companies with active claim opportunities — coming soon.',
);

export default function CompaniesPage() {
  return (
    <ComingSoon
      title="Company directory — coming soon"
      description="Explore companies with active refund, compensation and claim opportunities. Add companies to your watchlist for personalised alerts."
    />
  );
}
