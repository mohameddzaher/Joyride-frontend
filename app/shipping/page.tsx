import type { Metadata } from 'next';
import PolicyPageContent from '@/components/PolicyPageContent';

export const metadata: Metadata = {
  title: 'Shipping Information | Joyride',
  description: 'Joyride shipping policy: delivery areas, shipping rates, order processing times, tracking information, and delivery instructions across Saudi Arabia.',
  openGraph: {
    title: 'Shipping Information | Joyride',
    description: 'Learn about Joyride delivery areas, shipping rates, and tracking.',
  },
};

export default function ShippingPage() {
  return <PolicyPageContent slug="shipping" fallbackTitle="Shipping Information" />;
}
