'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { brandsApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

// Local brand images mapping (name lowercase -> path)
const localBrandImages: Record<string, string> = {
  'melissa & doug': '/images/brands/melissa-doug.png',
  'melissa and doug': '/images/brands/melissa-doug.png',
  'fisher-price': '/images/brands/fisher-price.png',
  'fisher price': '/images/brands/fisher-price.png',
  lego: '/images/brands/lego.png',
  hape: '/images/brands/hape.png',
  'learning resources': '/images/brands/learning-resources.png',
  vtech: '/images/brands/vtech.png',
  playmobil: '/images/brands/playmobil.png',
  hasbro: '/images/brands/hasbro.png',
};

// All brands with local images as fallback
const fallbackBrands = [
  { name: 'Melissa & Doug', logo: '/images/brands/melissa-doug.png' },
  { name: 'Fisher-Price', logo: '/images/brands/fisher-price.png' },
  { name: 'LEGO', logo: '/images/brands/lego.png' },
  { name: 'Hape', logo: '/images/brands/hape.png' },
  { name: 'Learning Resources', logo: '/images/brands/learning-resources.png' },
  { name: 'VTech', logo: '/images/brands/vtech.png' },
  { name: 'Playmobil', logo: '/images/brands/playmobil.png' },
  { name: 'Hasbro', logo: '/images/brands/hasbro.png' },
];

// Resolve logo: use API logo if it's a valid URL/path, otherwise try local mapping
function resolveLogo(name: string, apiLogo?: string): string {
  if (apiLogo && (apiLogo.startsWith('http') || apiLogo.startsWith('/images/'))) {
    return apiLogo;
  }
  return localBrandImages[name.toLowerCase()] || '';
}

export function Brands() {
  const { t } = useI18n();
  const { data: apiBrands } = useQuery({
    queryKey: ['brands-homepage'],
    queryFn: () => brandsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  // Always start with all local brands, then merge any extra API brands
  const brands = (() => {
    const result = [...fallbackBrands];
    if (apiBrands && apiBrands.length > 0) {
      const existingNames = new Set(result.map(b => b.name.toLowerCase()));
      for (const b of apiBrands) {
        if (!existingNames.has(b.name.toLowerCase())) {
          const logo = resolveLogo(b.name, b.logo);
          if (logo) {
            result.push({ name: b.name, logo });
            existingNames.add(b.name.toLowerCase());
          }
        }
      }
    }
    return result;
  })();

  const duplicated = [...brands, ...brands];

  return (
    <section className="py-10 bg-white border-y border-beige-200 overflow-hidden">
      <div className="container-custom">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-sm font-medium text-dark-600 mb-6 uppercase tracking-wider"
        >
          {t('brands.authorizedRetailer')}
        </motion.p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee hover:pause-animation">
          {duplicated.map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="flex-shrink-0 flex items-center justify-center w-28 md:w-36 h-16 mx-4 opacity-100 hover:opacity-80 transition-all duration-300 cursor-pointer"
            >
              <BrandImage src={brand.logo} alt={brand.name} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

function BrandImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <span className="text-sm font-semibold text-dark-400 tracking-wide whitespace-nowrap">
        {alt}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="max-h-10 md:max-h-12 w-auto object-contain hover:grayscale-0 transition-all"
      style={{ maxWidth: '100px' }}
      onError={() => setFailed(true)}
    />
  );
}

export default Brands;
