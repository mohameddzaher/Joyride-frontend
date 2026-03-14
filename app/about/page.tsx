import type { Metadata } from 'next';
import AboutPageContent from '@/components/AboutPageContent';

export const metadata: Metadata = {
  title: 'About Us | Joyride',
  description: 'Learn about JOYRIDE - Saudi Arabia\'s leading e-commerce platform for premium therapeutic toys. Our story, mission, values, and the team behind Joyride.',
  openGraph: {
    title: 'About Joyride',
    description: 'Learn about JOYRIDE - Saudi Arabia\'s leading e-commerce platform for premium therapeutic toys.',
  },
};

export default function AboutPage() {
  return <AboutPageContent />;
}
