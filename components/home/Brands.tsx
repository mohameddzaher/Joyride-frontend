'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { brandsApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

// Fallback brands shown while API loads (matches actual store brands with their logos)
const fallbackBrands = [
  { name: 'Classic World', logo: 'https://res.cloudinary.com/ddxp3sday/image/upload/v1775506502/download_3_xmyfzy.png' },
  { name: 'Fat Brain Toy', logo: 'https://res.cloudinary.com/ddxp3sday/image/upload/v1775508053/fat_vwkbgo.webp' },
  { name: 'Hape', logo: 'https://res.cloudinary.com/ddxp3sday/image/upload/v1775507847/fg_zojpgv.jpg' },
  { name: 'Learning Resources', logo: 'https://res.cloudinary.com/ddxp3sday/image/upload/v1775508062/learn_t4lmwz.png' },
  { name: 'Melissa & Doug', logo: 'https://res.cloudinary.com/ddxp3sday/image/upload/v1775507837/download_2_vff_arnnbd.png' },
  { name: 'Mideer', logo: 'https://res.cloudinary.com/ddxp3sday/image/upload/v1775506610/download_4_iwmafw.png' },
  { name: 'Montessori', logo: 'https://res.cloudinary.com/ddxp3sday/image/upload/v1775506889/download_5o_boy4ns.png' },
  { name: 'Tooky Toy', logo: 'https://res.cloudinary.com/ddxp3sday/image/upload/v1775506370/download_1_alhuqc.png' },
  { name: 'Top Bright', logo: 'https://res.cloudinary.com/ddxp3sday/image/upload/v1775506107/download_uvmazh.png' },
];

// Resolve logo: use API logo if it's a valid URL/path
function resolveLogo(_name: string, apiLogo?: string): string {
  if (apiLogo && (apiLogo.startsWith('http') || apiLogo.startsWith('/images/'))) {
    return apiLogo;
  }
  return '';
}

export function Brands() {
  const { t } = useI18n();
  const { data: apiBrands } = useQuery({
    queryKey: ['brands-homepage'],
    queryFn: () => brandsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  // Use API brands if available, otherwise show fallback text brands
  const brands = (() => {
    if (apiBrands && apiBrands.length > 0) {
      return apiBrands.map((b: any) => ({
        name: b.name,
        logo: resolveLogo(b.name, b.logo),
      }));
    }
    return fallbackBrands;
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
