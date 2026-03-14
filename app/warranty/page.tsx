import type { Metadata } from 'next';
import PolicyPageContent from '@/components/PolicyPageContent';

export const metadata: Metadata = {
  title: 'Warranty Policy | Joyride',
  description: 'Joyride warranty coverage: warranty periods by product category, what is covered, how to claim warranty, service options, and extended warranty plans.',
  openGraph: {
    title: 'Warranty Policy | Joyride',
    description: 'Learn about Joyride warranty coverage and how to claim warranty.',
  },
};

export default function WarrantyPage() {
  return <PolicyPageContent slug="warranty" fallbackTitle="Warranty Policy" />;
}
