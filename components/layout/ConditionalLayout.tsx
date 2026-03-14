'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { CompareFloatingWidget } from '@/components/product/CompareFloatingWidget';
import { useI18n } from '@/lib/i18n';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    // Admin pages have their own layout, don't show main Navbar/Footer
    return <>{children}</>;
  }

  return (
    <>
      {/* Skip to content link for keyboard navigation (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
      >
        {t('accessibility.skipToContent')}
      </a>
      <Navbar />
      <main id="main-content" className="flex-1" role="main">{children}</main>
      <Footer />
      <CartDrawer />
      <CompareFloatingWidget />
    </>
  );
}

export default ConditionalLayout;
