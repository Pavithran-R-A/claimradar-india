import { ComingSoon, generateComingSoonMetadata } from '@/components/coming-soon';

export const metadata = generateComingSoonMetadata(
  'Sectors',
  'Browse claim opportunities by industry sector — coming soon.',
);

export default function SectorsPage() {
  return (
    <ComingSoon
      title="Sectors — coming soon"
      description="Explore claimable opportunities organised by industry sector — banking, telecom, e-commerce, insurance, travel and more."
    />
  );
}
