'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition, Popover } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import {
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineSearch,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineBell,
  HiChevronDown,
} from 'react-icons/hi';
import { cn } from '@/lib/utils';
import { useAuthStore, useCartStore, useUIStore, useWishlistStore } from '@/lib/store';
import { categoriesApi } from '@/lib/api';
import { useSettings } from '@/lib/settings-context';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui';

// Fixed header heights
const TOP_BAR_HEIGHT = 32; // h-8 = 32px
const MAIN_NAV_HEIGHT = 64; // h-16 = 64px
const TOTAL_HEADER_HEIGHT = TOP_BAR_HEIGHT + MAIN_NAV_HEIGHT; // 96px on desktop

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useSettings();
  const { locale, setLocale, t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.products'), href: '/products' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  // Fetch categories dynamically
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const { user, isAuthenticated } = useAuthStore();
  const { items: cartItems, openCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-soft'
            : 'bg-white'
        )}
      >
        {/* Top bar - fixed height */}
        <div className="hidden lg:block bg-dark-950 text-white h-8">
          <div className="container-custom h-full flex items-center justify-between text-xs">
            <p>
              {settings.enableFreeShipping && settings.freeShippingThreshold
                ? t('trustBadges.freeShipping') + ' — ' + t('trustBadges.freeShippingDesc')
                : `${t('common.welcome')} ${settings.siteName}`}
            </p>
            <div className="flex items-center gap-4">
              <Link href="/track-order" className="hover:text-primary-300 transition-colors">
                {t('nav.trackOrder')}
              </Link>
              <span>|</span>
              <Link href="/contact" className="hover:text-primary-300 transition-colors">
                {t('nav.helpCenter')}
              </Link>
            </div>
          </div>
        </div>

        {/* Main navbar - fixed height */}
        <nav className="container-custom h-16" aria-label={t('nav.menu')}>
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center z-10" aria-label={settings.siteName}>
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.siteName}
                  className="h-10 w-auto"
                />
              ) : (
                <Image
                  src="/images/logo.png"
                  alt={settings.siteName}
                  width={120}
                  height={46}
                  className="h-10 w-auto"
                  priority
                />
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-dark-700 hover:text-dark-900 hover:bg-beige-100'
                  )}
                >
                  {item.name}
                </Link>
              ))}

              {/* Categories Dropdown */}
              <Popover className="relative">
                {({ open }) => (
                  <>
                    <Popover.Button
                      className={cn(
                        'flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none',
                        open
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-dark-700 hover:text-dark-900 hover:bg-beige-100'
                      )}
                    >
                      {t('nav.categories')}
                      <HiChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform',
                          open && 'rotate-180'
                        )}
                      />
                    </Popover.Button>

                    {open && <Popover.Overlay className="fixed inset-0 z-30" />}

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute left-0 z-10 mt-3 w-screen max-w-md">
                        {({ close }) => (
                        <div className="overflow-hidden rounded-xl bg-white shadow-soft-lg ring-1 ring-beige-200">
                          {categories.length === 0 ? (
                            <div className="p-6 text-center text-sm text-dark-500">
                              {t('nav.noCategories')}
                            </div>
                          ) : (
                            <div className="p-4 grid grid-cols-2 gap-4">
                              {categories.map((category: any) => (
                                <div key={category._id}>
                                  <Link
                                    href={`/products?category=${category._id}`}
                                    onClick={() => close()}
                                    className="block font-medium text-dark-900 hover:text-primary-600 transition-colors"
                                  >
                                    {category.name}
                                    {category.productCount > 0 && (
                                      <span className="ml-1 text-xs text-dark-400 font-normal">
                                        ({category.productCount})
                                      </span>
                                    )}
                                  </Link>
                                  {category.subcategories?.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                      {category.subcategories.map((sub: any) => (
                                        <li key={sub._id}>
                                          <Link
                                            href={`/products?category=${sub._id}`}
                                            onClick={() => close()}
                                            className="block text-sm text-dark-500 hover:text-primary-600 transition-colors"
                                          >
                                            {sub.name}
                                            {sub.productCount > 0 && (
                                              <span className="ml-1 text-xs text-dark-400">
                                                ({sub.productCount})
                                              </span>
                                            )}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="p-4 bg-beige-50 border-t border-beige-200">
                            <Link
                              href="/products"
                              onClick={() => close()}
                              className="text-sm font-medium text-primary-600 hover:text-primary-700"
                            >
                              {t('nav.viewAllProducts')} →
                            </Link>
                          </div>
                        </div>
                        )}
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                className="px-2.5 py-1.5 text-xs font-medium text-dark-600 hover:text-dark-900 hover:bg-beige-100 rounded-lg transition-colors"
                aria-label={locale === 'en' ? t('language.switchToArabic') : t('language.switchToEnglish')}
              >
                {locale === 'en' ? t('language.switchToArabic') : t('language.switchToEnglish')}
              </button>

              {/* Search */}
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 text-dark-600 hover:text-dark-900 transition-colors"
                aria-label={t('accessibility.openSearch')}
              >
                <HiOutlineSearch size={22} />
              </button>

              {/* Wishlist */}
              <Link
                href="/account/wishlist"
                className="relative p-2 text-dark-600 hover:text-dark-900 transition-colors hidden sm:flex"
                aria-label={t('nav.wishlist')}
              >
                <HiOutlineHeart size={22} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold text-white bg-primary-600 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 text-dark-600 hover:text-dark-900 transition-colors"
                aria-label={t('accessibility.openCart')}
              >
                <HiOutlineShoppingBag size={22} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold text-white bg-primary-600 rounded-full flex items-center justify-center">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>

              {/* User */}
              {isAuthenticated ? (
                <Popover className="relative">
                  {({ open, close }) => (
                    <>
                      <Popover.Button
                        className="p-2 text-dark-600 hover:text-dark-900 transition-colors focus:outline-none"
                        aria-label={t('nav.myProfile')}
                      >
                        <HiOutlineUser size={22} />
                      </Popover.Button>

                      {open && <Popover.Overlay className="fixed inset-0 z-30" />}

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                      <Popover.Panel className="absolute right-0 z-10 mt-3 w-56">
                          <div className="overflow-hidden rounded-xl bg-white shadow-soft-lg ring-1 ring-beige-200">
                            <div className="p-3 border-b border-beige-200">
                              <p className="text-sm font-medium text-dark-900">
                                {user?.name}
                              </p>
                              <p className="text-xs text-dark-500">{user?.email}</p>
                            </div>
                            <div className="p-2">
                              <Link
                                href="/account/profile"
                                onClick={() => close()}
                                className="block px-3 py-2 text-sm text-dark-700 hover:bg-beige-50 rounded-lg"
                              >
                                {t('nav.myProfile')}
                              </Link>
                              <Link
                                href="/account/orders"
                                onClick={() => close()}
                                className="block px-3 py-2 text-sm text-dark-700 hover:bg-beige-50 rounded-lg"
                              >
                                {t('nav.myOrders')}
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  close();
                                  openCart();
                                }}
                                className="block w-full text-left px-3 py-2 text-sm text-dark-700 hover:bg-beige-50 rounded-lg"
                              >
                                {t('nav.myCart')}
                                {cartItemCount > 0 && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-600 rounded-full">
                                    {cartItemCount}
                                  </span>
                                )}
                              </button>
                              <Link
                                href="/account/wishlist"
                                onClick={() => close()}
                                className="block px-3 py-2 text-sm text-dark-700 hover:bg-beige-50 rounded-lg"
                              >
                                {t('nav.wishlist')}
                                {wishlistItems.length > 0 && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-600 rounded-full">
                                    {wishlistItems.length}
                                  </span>
                                )}
                              </Link>
                              <Link
                                href="/account/addresses"
                                onClick={() => close()}
                                className="block px-3 py-2 text-sm text-dark-700 hover:bg-beige-50 rounded-lg"
                              >
                                {t('nav.addresses')}
                              </Link>
                              <Link
                                href="/account/referrals"
                                onClick={() => close()}
                                className="block px-3 py-2 text-sm text-dark-700 hover:bg-beige-50 rounded-lg"
                              >
                                {t('nav.referEarn')}
                              </Link>
                              {(user?.role === 'admin' ||
                                user?.role === 'super_admin') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    close();
                                    router.push('/admin');
                                  }}
                                  className="block w-full text-left px-3 py-2 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-lg"
                                >
                                  {t('nav.adminPanel')}
                                </button>
                              )}
                            </div>
                            <div className="p-2 border-t border-beige-200">
                              <button
                                onClick={() => {
                                  useAuthStore.getState().logout();
                                  window.location.href = '/';
                                }}
                                className="block w-full text-left px-3 py-2 text-sm text-error-600 hover:bg-error-50 rounded-lg"
                              >
                                {t('nav.logOut')}
                              </button>
                            </div>
                          </div>
                        </Popover.Panel>
                      </Transition>
                    </>
                  )}
                </Popover>
              ) : (
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="primary" size="sm">
                    {t('nav.signIn')}
                  </Button>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-dark-600 hover:text-dark-900 transition-colors"
                aria-label={isMobileMenuOpen ? t('nav.closeMenu') : t('accessibility.openMenu')}
              >
                {isMobileMenuOpen ? (
                  <HiOutlineX size={24} />
                ) : (
                  <HiOutlineMenu size={24} />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Search Modal */}
      <Transition show={showSearch} as={Fragment}>
        <Dialog onClose={() => setShowSearch(false)} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-dark-950/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-start justify-center p-4 pt-20">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-soft-xl transition-all">
                  <form onSubmit={handleSearch} className="flex items-center p-4">
                    <HiOutlineSearch className="text-dark-400 mr-3" size={24} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('nav.searchProducts')}
                      className="flex-1 text-lg outline-none border-none ring-0 focus:outline-none focus:border-none focus:ring-0 placeholder:text-dark-400 bg-transparent"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowSearch(false)}
                      className="p-2 text-dark-400 hover:text-dark-600"
                      aria-label={t('nav.closeSearch')}
                    >
                      <HiOutlineX size={20} />
                    </button>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Mobile Menu */}
      <Transition show={isMobileMenuOpen} as={Fragment}>
        <Dialog onClose={closeMobileMenu} className="relative z-50 lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-dark-950/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-x-full"
              enterTo="opacity-100 translate-x-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-x-0"
              leaveTo="opacity-0 translate-x-full"
            >
              <Dialog.Panel className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-soft-xl">
                <div className="flex items-center justify-between p-4 border-b border-beige-200">
                  {settings.logo ? (
                    <img
                      src={settings.logo}
                      alt={settings.siteName}
                      className="h-8 w-auto"
                    />
                  ) : (
                    <Image
                      src="/images/logo.png"
                      alt={settings.siteName}
                      width={100}
                      height={38}
                      className="h-8 w-auto"
                    />
                  )}
                  <button
                    type="button"
                    onClick={closeMobileMenu}
                    className="p-2 text-dark-600 hover:text-dark-900"
                    aria-label={t('nav.closeMenu')}
                  >
                    <HiOutlineX size={24} />
                  </button>
                </div>

                <div className="p-4 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'block px-4 py-3 text-sm font-medium rounded-lg',
                        pathname === item.href
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-dark-700 hover:bg-beige-100'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {/* Dynamic Categories */}
                  {categories.length > 0 && (
                    <div className="border-t border-beige-200 mt-2 pt-2">
                      <p className="px-4 py-2 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                        {t('nav.categories')}
                      </p>
                      {categories.map((cat: any) => (
                        <div key={cat._id}>
                          <div className="flex items-center">
                            <Link
                              href={`/products?category=${cat._id}`}
                              className="flex-1 block px-4 py-2.5 text-sm font-medium text-dark-700 hover:bg-beige-100 rounded-lg"
                            >
                              {cat.name}
                            </Link>
                            {cat.subcategories?.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setExpandedCat(expandedCat === cat._id ? null : cat._id)}
                                className="p-2 text-dark-400 hover:text-dark-600"
                                aria-label={`${cat.name}`}
                              >
                                <HiChevronDown
                                  size={16}
                                  className={cn(
                                    'transition-transform',
                                    expandedCat === cat._id && 'rotate-180'
                                  )}
                                />
                              </button>
                            )}
                          </div>
                          {expandedCat === cat._id && cat.subcategories?.map((sub: any) => (
                            <Link
                              key={sub._id}
                              href={`/products?category=${sub._id}`}
                              className="block pl-8 pr-4 py-2 text-sm text-dark-500 hover:bg-beige-100 rounded-lg"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-beige-200">
                  {isAuthenticated ? (
                    <div className="space-y-1">
                      <Link
                        href="/account/profile"
                        className="block px-4 py-2.5 text-sm font-medium text-dark-700 hover:bg-beige-100 rounded-lg"
                      >
                        {t('nav.myProfile')}
                      </Link>
                      <Link
                        href="/account/orders"
                        className="block px-4 py-2.5 text-sm font-medium text-dark-700 hover:bg-beige-100 rounded-lg"
                      >
                        {t('nav.myOrders')}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          closeMobileMenu();
                          openCart();
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm font-medium text-dark-700 hover:bg-beige-100 rounded-lg"
                      >
                        {t('nav.myCart')}
                        {cartItemCount > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-600 rounded-full">
                            {cartItemCount}
                          </span>
                        )}
                      </button>
                      <Link
                        href="/account/wishlist"
                        className="block px-4 py-2.5 text-sm font-medium text-dark-700 hover:bg-beige-100 rounded-lg"
                      >
                        {t('nav.wishlist')}
                        {wishlistItems.length > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-600 rounded-full">
                            {wishlistItems.length}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/account/addresses"
                        className="block px-4 py-2.5 text-sm font-medium text-dark-700 hover:bg-beige-100 rounded-lg"
                      >
                        {t('nav.addresses')}
                      </Link>
                      <Link
                        href="/account/referrals"
                        className="block px-4 py-2.5 text-sm font-medium text-dark-700 hover:bg-beige-100 rounded-lg"
                      >
                        {t('nav.referEarn')}
                      </Link>
                      {(user?.role === 'admin' ||
                        user?.role === 'super_admin') && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg"
                        >
                          {t('nav.adminPanel')}
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          useAuthStore.getState().logout();
                          closeMobileMenu();
                          window.location.href = '/';
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50 rounded-lg mt-2"
                      >
                        {t('nav.logOut')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link href="/auth/login" className="block">
                        <Button variant="primary" fullWidth>
                          {t('nav.signIn')}
                        </Button>
                      </Link>
                      <Link href="/auth/register" className="block">
                        <Button variant="secondary" fullWidth>
                          {t('nav.signUp')}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Spacer for fixed header - matches header height */}
      <div className="h-16 lg:h-24" />
    </>
  );
}

export default Navbar;
