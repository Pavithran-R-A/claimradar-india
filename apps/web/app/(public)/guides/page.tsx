import { ComingSoon, generateComingSoonMetadata } from '@/components/coming-soon';

export const metadata = generateComingSoonMetadata(
  'Guides',
  'Educational guides on consumer rights and claim processes — coming soon.',
);

export default function GuidesPage() {
  return (
    <ComingSoon
      title="Guides — coming soon"
      description="In-depth guides on consumer rights, how to file complaints, understanding court orders, navigating regulatory processes and more."
    />
  );
}
