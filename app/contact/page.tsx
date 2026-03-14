import type { Metadata } from 'next';
import ContactPageContent from '@/components/ContactPageContent';

export const metadata: Metadata = {
  title: 'Contact Us | Joyride',
  description: 'Get in touch with Joyride. Contact us for questions about orders, products, returns, or general inquiries. Email, phone, and social media support available.',
  openGraph: {
    title: 'Contact Us | Joyride',
    description: 'Get in touch with Joyride for questions, support, and inquiries.',
  },
};

export default function ContactPage() {
  return <ContactPageContent />;
}
