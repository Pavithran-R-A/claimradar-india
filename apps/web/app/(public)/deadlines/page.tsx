import { ComingSoon, generateComingSoonMetadata } from '@/components/coming-soon';

export const metadata = generateComingSoonMetadata(
  'Deadlines',
  'Track upcoming claim deadlines — coming soon.',
);

export default function DeadlinesPage() {
  return (
    <ComingSoon
      title="Deadlines — coming soon"
      description="View all upcoming claim deadlines sorted by urgency. Never miss a filing window for refund or compensation opportunities."
    />
  );
}
