'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiArrowRight } from 'react-icons/hi';
import { cmsApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { Skeleton } from '@/components/ui';

const MAX_FAQS = 6;

export function HomeFAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useI18n();

  const fallbackFaqs = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') },
    { question: t('faq.q6'), answer: t('faq.a6') },
  ];

  const { data: apiFaqs, isLoading } = useQuery({
    queryKey: ['faqs-home'],
    queryFn: async () => {
      try {
        const data = await cmsApi.getFaqs();
        return data;
      } catch {
        return null;
      }
    },
  });

  const allFaqs = apiFaqs && apiFaqs.length > 0 ? apiFaqs : fallbackFaqs;
  const faqs = allFaqs.slice(0, MAX_FAQS);
  const hasMore = allFaqs.length > MAX_FAQS;

  return (
    <section className="py-16 bg-beige-50">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Section Header */}
        <div className="text-center mb-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4"
          >
            FAQ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-display font-semibold text-dark-900 mb-3"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-dark-500"
          >
            Find answers to common questions about our products and services.
          </motion.p>
        </div>

        {/* FAQ Accordion */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="rounded" className="h-16" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq: any, index: number) => (
              <motion.div
                key={faq._id || index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-beige-50 transition-colors"
                >
                  <span className="font-medium text-dark-900 pr-4">
                    {faq.question}
                  </span>
                  <HiChevronDown
                    size={20}
                    className={`flex-shrink-0 text-dark-400 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-sm text-dark-600 leading-relaxed border-t border-beige-100 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Link */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-8"
          >
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-medium rounded-xl shadow-sm hover:shadow-md hover:bg-primary-50 transition-all"
            >
              View All FAQs
              <HiArrowRight size={16} />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
