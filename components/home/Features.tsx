'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { cmsApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export function Features() {
  const { t } = useI18n();

  const defaultFeatures = [
    { icon: '🚚', title: t('features.freeShipping'), description: t('features.freeShippingDesc') },
    { icon: '🛡️', title: t('features.safetyCertified'), description: t('features.safetyCertifiedDesc') },
    { icon: '↩️', title: t('features.easyReturns'), description: t('features.easyReturnsDesc') },
    { icon: '👩‍⚕️', title: t('features.expertSupport'), description: t('features.expertSupportDesc') },
  ];

  const { data: cmsData } = useQuery({
    queryKey: ['cms-homepage-features'],
    queryFn: () => cmsApi.getContent('homepage_features'),
    staleTime: 5 * 60 * 1000,
  });

  const { locale } = useI18n();

  let features = defaultFeatures;
  try {
    if (cmsData?.value) {
      const parsed = typeof cmsData.value === 'string' ? JSON.parse(cmsData.value) : cmsData.value;
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Map bilingual fields to the correct locale, falling back to old single-language fields
        features = parsed.map((f: any) => ({
          icon: f.icon,
          title: (locale === 'ar' ? f.titleAr : f.titleEn) || f.title || '',
          description: (locale === 'ar' ? f.descriptionAr : f.descriptionEn) || f.description || '',
        }));
      }
    }
  } catch {
    // use defaults
  }

  return (
    <section className="py-12 border-y border-beige-200 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature: any, index: number) => (
            <motion.div
              key={feature.title || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
                <span className="text-xl">{feature.icon}</span>
              </div>
              <h3 className="text-sm font-semibold text-dark-900">
                {feature.title}
              </h3>
              <p className="mt-1 text-xs text-dark-500">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
