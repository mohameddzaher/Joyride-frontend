import type { Metadata } from 'next';
import FAQPageContent from '@/components/FAQPageContent';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | Joyride',
  description: 'Find answers to common questions about Joyride orders, payments, delivery, returns, warranty, and more. Get help with your shopping experience.',
  openGraph: {
    title: 'FAQ | Joyride',
    description: 'Find answers to common questions about Joyride orders, payments, delivery, and returns.',
  },
};

export default function FAQPage() {
  return <FAQPageContent />;
}
