'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { cmsApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/lib/settings-context';

export function WhyChooseUs() {
  const { t, locale } = useI18n();
  const { settings } = useSettings();

  const defaultData = {
    badge: t('whyChooseUs.badge'),
    title: t('whyChooseUs.title'),
    description: t('whyChooseUs.description'),
    reasons: [
      { icon: '👩‍⚕️', title: t('whyChooseUs.reason1Title'), description: t('whyChooseUs.reason1Desc') },
      { icon: '💰', title: t('whyChooseUs.reason2Title'), description: t('whyChooseUs.reason2Desc') },
      { icon: '🚀', title: t('whyChooseUs.reason3Title'), description: t('whyChooseUs.reason3Desc') },
      { icon: '🛡️', title: t('whyChooseUs.reason4Title'), description: t('whyChooseUs.reason4Desc') },
      { icon: '↩️', title: t('whyChooseUs.reason5Title'), description: t('whyChooseUs.reason5Desc') },
      { icon: '🧠', title: t('whyChooseUs.reason6Title'), description: t('whyChooseUs.reason6Desc') },
    ],
    cta: {
      title: t('whyChooseUs.ctaTitle'),
      description: t('whyChooseUs.ctaDesc'),
      phone: t('whyChooseUs.ctaPhone'),
      buttonText: t('whyChooseUs.ctaButton'),
      buttonLink: '/contact',
    },
  };

  const { data: cmsData } = useQuery({
    queryKey: ['cms-homepage-why-choose-us'],
    queryFn: () => cmsApi.getContent('homepage_why_choose_us'),
    staleTime: 5 * 60 * 1000,
  });

  let content = defaultData;
  try {
    if (cmsData?.value) {
      const parsed = typeof cmsData.value === 'string' ? JSON.parse(cmsData.value) : cmsData.value;
      if (parsed && parsed.reasons) {
        const isAr = locale === 'ar';
        content = {
          ...defaultData,
          badge: (isAr ? parsed.badgeAr : parsed.badgeEn) || parsed.badge || defaultData.badge,
          title: (isAr ? parsed.titleAr : parsed.titleEn) || parsed.title || defaultData.title,
          description: (isAr ? parsed.descriptionAr : parsed.descriptionEn) || parsed.description || defaultData.description,
          reasons: parsed.reasons.map((r: any) => ({
            icon: r.icon,
            title: (isAr ? r.titleAr : r.titleEn) || r.title || '',
            description: (isAr ? r.descriptionAr : r.descriptionEn) || r.description || '',
          })),
          cta: {
            title: (isAr ? parsed.cta?.titleAr : parsed.cta?.titleEn) || parsed.cta?.title || defaultData.cta.title,
            description: (isAr ? parsed.cta?.descriptionAr : parsed.cta?.descriptionEn) || parsed.cta?.description || defaultData.cta.description,
            phone: parsed.cta?.phone || defaultData.cta.phone,
            buttonText: (isAr ? parsed.cta?.buttonTextAr : parsed.cta?.buttonTextEn) || parsed.cta?.buttonText || defaultData.cta.buttonText,
            buttonLink: parsed.cta?.buttonLink || defaultData.cta.buttonLink,
          },
        };
      }
    }
  } catch {
    // use defaults
  }

  return (
    <section className="section bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm text-primary-600 font-medium uppercase tracking-wider"
          >
            {content.badge}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-3xl md:text-4xl font-display font-semibold text-dark-900"
          >
            {content.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-dark-600"
          >
            {content.description}
          </motion.p>
        </div>

        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {content.reasons.map((reason: any, index: number) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl border border-beige-200 hover:border-primary-200 hover:shadow-soft transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center text-primary-600 transition-colors mb-4">
                <span className="text-2xl">{reason.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-dark-900 group-hover:text-primary-600 transition-colors">
                {reason.title}
              </h3>
              <p className="mt-2 text-dark-500 text-sm leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 p-8 md:p-12 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center"
        >
          <h3 className="text-2xl md:text-3xl font-display font-semibold">
            {content.cta.title}
          </h3>
          <p className="mt-2 text-white/80 max-w-xl mx-auto">
            {content.cta.description}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {settings.sitePhone && (
              <a
                href={`tel:${settings.sitePhone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
              >
                {settings.sitePhone}
              </a>
            )}
            <a
              href={content.cta.buttonLink}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20"
            >
              {content.cta.buttonText}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
