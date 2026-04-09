'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';
import { categoriesApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import { Skeleton } from '@/components/ui';
import { useI18n } from '@/lib/i18n';

// Fallback placeholder for categories without images
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600';

export function Categories() {
  const { t } = useI18n();
  const { data: categories, isLoading } = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: categoriesApi.getAll,
  });

  // Filter to show only parent categories (no parentId)
  const parentCategories = categories?.filter((cat: any) => !cat.parentId) || [];

  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs text-primary-600 font-medium uppercase tracking-wider"
          >
            {t('shopByCategory')}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-2xl md:text-3xl font-display font-semibold text-dark-900"
          >
            {t('browseCollections')}
          </motion.h2>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="rounded" className="aspect-square" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {parentCategories.slice(0, 6).map((category: any, index: number) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="w-[calc(33.333%-6px)] sm:w-[calc(25%-6px)] md:w-[calc(16.666%-8px)]"
              >
                <Link
                  href={`/categories/${category.slug}`}
                  className="group block relative aspect-square rounded-xl overflow-hidden"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 bg-beige-200">
                    <Image
                      src={category.image || PLACEHOLDER_IMAGE}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                    />
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-dark-950/30 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-2 md:p-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-primary-300 transition-colors line-clamp-1">
                      {category.name}
                    </h3>
                    <p className="mt-0.5 text-[10px] text-white/70">
                      {category.productCount || 0} {t('items')}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Categories;
