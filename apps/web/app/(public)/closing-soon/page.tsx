import { ComingSoon, generateComingSoonMetadata } from '@/components/coming-soon';

export const metadata = generateComingSoonMetadata(
  'Closing Soon',
  'Claim opportunities with approaching deadlines — coming soon.',
);

export default function ClosingSoonPage() {
  return (
    <ComingSoon
      title="Closing soon — coming soon"
      description="View all claim opportunities with approaching deadlines. Filtered by urgency: 72 hours, 7 days, 14 days and 30 days remaining."
    />
  );
}
