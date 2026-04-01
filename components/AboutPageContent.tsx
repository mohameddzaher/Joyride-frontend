'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineHeart,
  HiOutlineRefresh,
} from 'react-icons/hi';
import { FaLinkedin, FaSnapchatGhost } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { Button, Card } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { cmsApi } from '@/lib/api';

interface TeamMember {
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  image: string;
  linkedinUrl?: string;
  snapchatUrl?: string;
}

interface AboutStat {
  value: string;
  labelKey: string;
}

const defaultTeam: TeamMember[] = [
  {
    nameAr: 'محمد زاهر',
    nameEn: 'Mohamed Zaher',
    roleAr: 'شريك مؤسس والرئيس التنفيذي',
    roleEn: 'Co-Founder & CEO',
    image: '/images/founders/mohamed-zaher.png',
    linkedinUrl: '',
    snapchatUrl: '',
  },
  {
    nameAr: 'ليان خالدي',
    nameEn: 'Layan Khaledi',
    roleAr: 'شريك مؤسس ومدير العمليات',
    roleEn: 'Co-Founder & COO',
    image: '/images/founders/layan-khaledi.png',
    linkedinUrl: '',
    snapchatUrl: '',
  },
];

const defaultStats: AboutStat[] = [
  { value: '1K+', labelKey: 'about.statsHappy' },
  { value: '500+', labelKey: 'about.statsProducts' },
  { value: '30+', labelKey: 'about.statsBrands' },
  { value: '4.8', labelKey: 'about.statsRating' },
];

export default function AboutPageContent() {
  const { t, locale } = useI18n();

  const { data: teamCmsData } = useQuery({
    queryKey: ['cms-about-team-members'],
    queryFn: () => cmsApi.getContent('about_team_members'),
    staleTime: 5 * 60 * 1000,
  });

  const { data: statsCmsData } = useQuery({
    queryKey: ['cms-about-stats'],
    queryFn: () => cmsApi.getContent('about_stats'),
    staleTime: 5 * 60 * 1000,
  });

  let team: TeamMember[] = defaultTeam;
  try {
    if (teamCmsData?.value) {
      const parsed = typeof teamCmsData.value === 'string' ? JSON.parse(teamCmsData.value) : teamCmsData.value;
      if (Array.isArray(parsed) && parsed.length > 0) team = parsed;
    }
  } catch {
    // use defaults
  }

  let statsData: AboutStat[] = defaultStats;
  try {
    if (statsCmsData?.value) {
      const parsed = typeof statsCmsData.value === 'string' ? JSON.parse(statsCmsData.value) : statsCmsData.value;
      if (Array.isArray(parsed) && parsed.length > 0) statsData = parsed;
    }
  } catch {
    // use defaults
  }

  const values = [
    {
      icon: HiOutlineShieldCheck,
      title: t('about.value1Title'),
      description: t('about.value1Desc'),
    },
    {
      icon: HiOutlineTruck,
      title: t('about.value2Title'),
      description: t('about.value2Desc'),
    },
    {
      icon: HiOutlineHeart,
      title: t('about.value3Title'),
      description: t('about.value3Desc'),
    },
    {
      icon: HiOutlineRefresh,
      title: t('about.value4Title'),
      description: t('about.value4Desc'),
    },
  ];

  const stats = statsData.map((s) => ({
    value: s.value,
    label: t(s.labelKey),
  }));

  return (
    <div className="min-h-screen bg-beige-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-display font-semibold mb-6">
              {t('about.title')}
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed">
              {t('about.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-display font-semibold text-dark-900 mb-6">
                {t('about.storyTitle')}
              </h2>
              <div className="space-y-4 text-dark-600">
                <p>{t('about.storyP1')}</p>
                <p>{t('about.storyP2')}</p>
                <p>{t('about.storyP3')}</p>
              </div>
              <div className="mt-8">
                <Link href="/products">
                  <Button size="lg">{t('about.ctaShop')}</Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-primary-50 to-beige-100 rounded-2xl overflow-hidden flex items-center justify-center p-12">
                <Image
                  src="/images/logo.png"
                  alt="Joyride"
                  width={400}
                  height={400}
                  className="object-contain"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-soft-lg">
                <p className="text-4xl font-bold text-primary-600">5+</p>
                <p className="text-dark-500">{t('about.yearsExcellence')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl font-bold text-primary-600 mb-1">
                  {stat.value}
                </p>
                <p className="text-dark-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-display font-semibold text-dark-900 mb-4">
              {t('about.valuesTitle')}
            </h2>
            <p className="text-dark-500 max-w-2xl mx-auto">
              {t('about.valuesDesc')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card padding="lg" className="h-full text-center">
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="text-primary-600" size={28} />
                  </div>
                  <h3 className="font-semibold text-dark-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-dark-500">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-display font-semibold text-dark-900 mb-4">
              {t('about.teamTitle')}
            </h2>
            <p className="text-dark-500 max-w-2xl mx-auto">
              {t('about.teamDesc')}
            </p>
          </motion.div>

          <div className={`grid grid-cols-1 ${team.length === 2 ? 'md:grid-cols-2 max-w-2xl' : 'md:grid-cols-3 max-w-4xl'} gap-8 mx-auto`}>
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden bg-beige-100">
                  <Image
                    src={member.image}
                    alt={locale === 'ar' ? member.nameAr : member.nameEn}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-dark-900">
                  {locale === 'ar' ? member.nameAr : member.nameEn}
                </h3>
                <p className="text-sm text-dark-500 mt-1">
                  {locale === 'ar' ? member.roleAr : member.roleEn}
                </p>
                <div className="flex items-center justify-center gap-3 mt-3">
                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`LinkedIn - ${locale === 'ar' ? member.nameAr : member.nameEn}`}
                      className="text-dark-400 hover:text-primary-600 transition-colors"
                    >
                      <FaLinkedin size={20} />
                    </a>
                  )}
                  {member.snapchatUrl && (
                    <a
                      href={member.snapchatUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Snapchat - ${locale === 'ar' ? member.nameAr : member.nameEn}`}
                      className="text-dark-400 hover:text-primary-600 transition-colors"
                    >
                      <FaSnapchatGhost size={20} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card
            padding="lg"
            className="bg-gradient-to-br from-primary-600 to-primary-700 text-white text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-display font-semibold mb-4">
              {t('about.ctaTitle')}
            </h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto">
              {t('about.ctaDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button variant="secondary" size="lg">
                  {t('about.ctaShop')}
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                >
                  {t('about.ctaContact')}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
