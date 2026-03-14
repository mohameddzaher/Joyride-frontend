import type { Metadata } from 'next';
import CareersPageContent from '@/components/CareersPageContent';

export const metadata: Metadata = {
  title: 'Careers | Joyride',
  description: 'Join the Joyride team! Explore career opportunities in engineering, marketing, operations, and more. Help us deliver premium therapeutic toys across Saudi Arabia.',
  openGraph: {
    title: 'Careers at Joyride',
    description: 'Explore career opportunities at Joyride.',
  },
};

export default function CareersPage() {
  return <CareersPageContent />;
}
