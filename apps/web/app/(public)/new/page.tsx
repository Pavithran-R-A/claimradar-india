import { ComingSoon, generateComingSoonMetadata } from '@/components/coming-soon';

export const metadata = generateComingSoonMetadata(
  'New Opportunities',
  'Recently published claim opportunities — coming soon.',
);

export default function NewPage() {
  return (
    <ComingSoon
      title="New opportunities — coming soon"
      description="See the latest claimable opportunities as they are published. Stay ahead with real-time alerts on new refund and compensation schemes."
    />
  );
}
