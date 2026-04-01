'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { bannersApi } from '@/lib/api';

export function TopBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: banners, isLoading } = useQuery({
    queryKey: ['top-banners'],
    queryFn: () => bannersApi.getByPosition('top_banner'),
  });

  const slides = banners?.filter((b: any) => b.isActive !== false) || [];

  // Auto-advance slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Don't render anything if no banners
  if (isLoading || slides.length === 0) return null;

  const currentBanner = slides[currentSlide];

  return (
    <section className="relative w-full max-h-[400px] overflow-hidden bg-dark-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full"
        >
          {currentBanner.link ? (
            <Link href={currentBanner.link}>
              <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]">
                <Image
                  src={currentBanner.image}
                  alt={currentBanner.title || 'Banner'}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </Link>
          ) : (
            <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]">
              <Image
                src={currentBanner.image}
                alt={currentBanner.title || 'Banner'}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_: any, index: number) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-6'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default TopBanner;
