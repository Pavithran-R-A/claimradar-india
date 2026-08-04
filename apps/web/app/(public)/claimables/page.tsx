import { ComingSoon, generateComingSoonMetadata } from '@/components/coming-soon';

export const metadata = generateComingSoonMetadata(
  'Claim Directory',
  'Browse all claimable opportunities — coming soon to ClaimRadar India.',
);

export default function ClaimablesPage() {
  return (
    <ComingSoon
      title="Claim directory — coming soon"
      description="Browse and search all published claimable opportunities from verified official sources. Filter by company, sector, status and deadline."
    />
  );
}
