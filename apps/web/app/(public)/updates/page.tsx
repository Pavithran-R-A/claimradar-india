import { ComingSoon, generateComingSoonMetadata } from '@/components/coming-soon';

export const metadata = generateComingSoonMetadata(
  'Updates',
  'Latest updates and changes to claim opportunities — coming soon.',
);

export default function UpdatesPage() {
  return (
    <ComingSoon
      title="Updates — coming soon"
      description="Stay informed with the latest updates — new opportunities, deadline changes, source corrections, status updates and editorial notes."
    />
  );
}
