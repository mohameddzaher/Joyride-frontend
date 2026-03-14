import type { Metadata } from 'next';
import TrackOrderPageContent from '@/components/TrackOrderPageContent';

export const metadata: Metadata = {
  title: 'Track Your Order | Joyride',
  description: 'Track your Joyride order status in real-time. Enter your order number to see delivery progress, estimated delivery date, and order details.',
  openGraph: {
    title: 'Track Your Order | Joyride',
    description: 'Track your Joyride order status and delivery progress.',
  },
};

export default function TrackOrderPage() {
  return <TrackOrderPageContent />;
}
