'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiOutlineX, HiOutlinePlus, HiOutlineSave } from 'react-icons/hi';
import { Button, Input, Card } from '@/components/ui';
import { cmsApi, adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

type SectionKey =
  | 'hero_banners_info'
  | 'homepage_features'
  | 'homepage_why_choose_us'
  | 'homepage_newsletter'
  | 'homepage_hero_badges'
  | 'homepage_hero_categories'
  | 'homepage_hero_promos';

const sections: { key: SectionKey; label: string }[] = [
  { key: 'hero_banners_info', label: 'Hero Banners' },
  { key: 'homepage_features', label: 'Features Bar' },
  { key: 'homepage_why_choose_us', label: 'Why Choose Us' },
  { key: 'homepage_newsletter', label: 'Newsletter' },
  { key: 'homepage_hero_badges', label: 'Hero Trust Badges' },
  { key: 'homepage_hero_categories', label: 'Hero Quick Categories' },
  { key: 'homepage_hero_promos', label: 'Hero Promo Cards' },
];

// Bilingual input pair helper
function BilingualInput({ labelEn, labelAr, valueEn, valueAr, onChangeEn, onChangeAr, placeholder, multiline }: {
  labelEn: string; labelAr: string; valueEn: string; valueAr: string;
  onChangeEn: (v: string) => void; onChangeAr: (v: string) => void;
  placeholder?: string; multiline?: boolean;
}) {
  const inputClass = "w-full px-3 py-2 border border-beige-300 rounded-lg text-sm";
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-medium text-dark-500 mb-1">{labelEn}</label>
        {multiline ? (
          <textarea className={inputClass} rows={2} value={valueEn} onChange={(e) => onChangeEn(e.target.value)} placeholder={placeholder} />
        ) : (
          <input className={inputClass} value={valueEn} onChange={(e) => onChangeEn(e.target.value)} placeholder={placeholder} />
        )}
      </div>
      <div>
        <label className="block text-xs font-medium text-dark-500 mb-1">{labelAr}</label>
        {multiline ? (
          <textarea className={inputClass + " text-right"} dir="rtl" rows={2} value={valueAr} onChange={(e) => onChangeAr(e.target.value)} placeholder={placeholder ? placeholder + ' (Arabic)' : ''} />
        ) : (
          <input className={inputClass + " text-right"} dir="rtl" value={valueAr} onChange={(e) => onChangeAr(e.target.value)} placeholder={placeholder ? placeholder + ' (Arabic)' : ''} />
        )}
      </div>
    </div>
  );
}

export default function HomepageContentPage() {
  const [activeTab, setActiveTab] = useState<SectionKey>('hero_banners_info');

  const { data: cmsData, isLoading } = useQuery({
    queryKey: ['cms-homepage-all'],
    queryFn: () =>
      cmsApi.getMultiple(sections.filter((s) => s.key !== 'hero_banners_info').map((s) => s.key)),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-dark-900">Homepage Content</h1>
        <p className="text-dark-500 mt-1">
          Manage all homepage sections. Changes appear immediately on the public website.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-beige-200 pb-2">
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActiveTab(section.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === section.key
                ? 'bg-primary-600 text-white'
                : 'bg-white text-dark-600 hover:bg-beige-100 border border-beige-200'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-beige-200 rounded-xl"></div>
        </div>
      ) : (
        <>
          {activeTab === 'hero_banners_info' && (
            <HeroBannersInfo />
          )}
          {activeTab === 'homepage_features' && (
            <FeaturesEditor data={cmsData?.homepage_features} />
          )}
          {activeTab === 'homepage_why_choose_us' && (
            <WhyChooseUsEditor data={cmsData?.homepage_why_choose_us} />
          )}
          {activeTab === 'homepage_newsletter' && (
            <NewsletterEditor data={cmsData?.homepage_newsletter} />
          )}
          {activeTab === 'homepage_hero_badges' && (
            <HeroBadgesEditor data={cmsData?.homepage_hero_badges} />
          )}
          {activeTab === 'homepage_hero_categories' && (
            <HeroCategoriesEditor data={cmsData?.homepage_hero_categories} />
          )}
          {activeTab === 'homepage_hero_promos' && (
            <HeroPromosEditor data={cmsData?.homepage_hero_promos} />
          )}
        </>
      )}
    </div>
  );
}

// ========== HELPER ==========

function parseCmsValue(data: any, fallback: any) {
  try {
    if (data?.value) {
      return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    }
  } catch {}
  return fallback;
}

function useSaveContent(key: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value: any) => adminApi.updateContent(key, JSON.stringify(value)),
    onSuccess: () => {
      // Invalidate admin bulk query
      queryClient.invalidateQueries({ queryKey: ['cms-homepage-all'] });
      // Invalidate homepage individual component queries (key uses dashes)
      const dashKey = key.replace(/_/g, '-');
      queryClient.invalidateQueries({ queryKey: [`cms-${key}`] });
      queryClient.invalidateQueries({ queryKey: [`cms-${dashKey}`] });
      toast.success('Saved successfully');
    },
    onError: () => toast.error('Failed to save'),
  });
}

// ========== HERO BANNERS INFO ==========

function HeroBannersInfo() {
  return (
    <Card padding="lg" className="space-y-4">
      <h3 className="font-semibold text-dark-900">Hero Banner Slides</h3>
      <p className="text-dark-600 text-sm">
        The hero section displays banners with position <strong>&quot;Hero Main&quot;</strong>. Each banner controls:
      </p>
      <ul className="list-disc list-inside text-sm text-dark-600 space-y-1 ml-2">
        <li><strong>Title</strong> -- the large heading text on the slide</li>
        <li><strong>Subtitle</strong> -- the badge/tag shown above the heading</li>
        <li><strong>Image</strong> -- the full-width background image</li>
        <li><strong>Link Text</strong> -- the CTA button label (e.g. &quot;Shop Now&quot;)</li>
        <li><strong>Link URL</strong> -- where the CTA button navigates to</li>
        <li><strong>Background Color</strong> -- fallback color behind the image</li>
      </ul>
      <p className="text-dark-600 text-sm">
        To add or edit hero slides, go to the Banners management page and create banners with position set to <strong>&quot;Hero Main&quot;</strong>.
      </p>
      <a
        href="/admin/banners"
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
      >
        Manage Hero Banners
        <HiOutlinePlus size={16} />
      </a>
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800">
          <strong>Tip:</strong> The trust badges, quick categories, and promo cards below the hero can be edited in the other tabs on this page.
        </p>
      </div>
    </Card>
  );
}

// ========== FEATURES EDITOR ==========

function FeaturesEditor({ data }: { data: any }) {
  const [items, setItems] = useState<Array<{ icon: string; titleEn: string; titleAr: string; descriptionEn: string; descriptionAr: string; title?: string; description?: string }>>([]);
  const save = useSaveContent('homepage_features');

  useEffect(() => {
    const parsed = parseCmsValue(data, [
      { icon: '🚚', titleEn: 'Free Shipping', titleAr: 'شحن مجاني', descriptionEn: 'On orders over SAR 500', descriptionAr: 'للطلبات فوق 500 ريال' },
      { icon: '🛡️', titleEn: '2 Year Warranty', titleAr: 'ضمان سنتين', descriptionEn: 'Full coverage guarantee', descriptionAr: 'ضمان تغطية شاملة' },
      { icon: '↩️', titleEn: 'Easy Returns', titleAr: 'إرجاع سهل', descriptionEn: '30-day return policy', descriptionAr: 'سياسة إرجاع 30 يوم' },
      { icon: '💬', titleEn: '24/7 Support', titleAr: 'دعم على مدار الساعة', descriptionEn: 'Expert assistance anytime', descriptionAr: 'مساعدة متخصصة في أي وقت' },
    ]);
    // Migrate old format: if items have title/description but not titleEn/titleAr
    const migrated = parsed.map((item: any) => ({
      icon: item.icon || '⭐',
      titleEn: item.titleEn || item.title || '',
      titleAr: item.titleAr || '',
      descriptionEn: item.descriptionEn || item.description || '',
      descriptionAr: item.descriptionAr || '',
    }));
    setItems(migrated);
  }, [data]);

  const updateItem = (i: number, field: string, value: string) => {
    const n = [...items];
    (n[i] as any)[field] = value;
    setItems(n);
  };

  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">Feature Cards</h3>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<HiOutlinePlus size={16} />}
          onClick={() => setItems([...items, { icon: '⭐', titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '' }])}
        >
          Add Feature
        </Button>
      </div>

      <p className="text-xs text-dark-500">Each feature has English and Arabic fields. The correct language is shown based on the visitor&apos;s selected language.</p>

      {items.map((item, i) => (
        <div key={i} className="p-4 bg-beige-50 rounded-lg space-y-3">
          <div className="flex gap-3 items-center">
            <input
              className="w-16 px-2 py-2 border border-beige-300 rounded-lg text-center text-xl"
              value={item.icon}
              onChange={(e) => updateItem(i, 'icon', e.target.value)}
              placeholder="Icon"
            />
            <span className="text-sm font-medium text-dark-700 flex-1">Feature #{i + 1}</span>
            <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 p-1" title="Remove">
              <HiOutlineX size={18} />
            </button>
          </div>
          <BilingualInput
            labelEn="Title (English)" labelAr="Title (Arabic)"
            valueEn={item.titleEn} valueAr={item.titleAr}
            onChangeEn={(v) => updateItem(i, 'titleEn', v)} onChangeAr={(v) => updateItem(i, 'titleAr', v)}
            placeholder="Feature title"
          />
          <BilingualInput
            labelEn="Description (English)" labelAr="Description (Arabic)"
            valueEn={item.descriptionEn} valueAr={item.descriptionAr}
            onChangeEn={(v) => updateItem(i, 'descriptionEn', v)} onChangeAr={(v) => updateItem(i, 'descriptionAr', v)}
            placeholder="Short description"
          />
        </div>
      ))}

      <Button leftIcon={<HiOutlineSave size={16} />} onClick={() => save.mutate(items)} isLoading={save.isPending}>
        Save Features
      </Button>
    </Card>
  );
}

// ========== WHY CHOOSE US EDITOR ==========

function WhyChooseUsEditor({ data }: { data: any }) {
  const defaultVal = {
    badgeEn: 'Why Shop With Us', badgeAr: 'لماذا تتسوق معنا',
    titleEn: 'The Joyride Difference', titleAr: 'فرق جوي رايد',
    descriptionEn: 'We are committed to providing you with the best shopping experience for premium therapeutic toys.',
    descriptionAr: 'نحن ملتزمون بتقديم أفضل تجربة تسوق لألعاب العلاج المتميزة.',
    reasons: [] as Array<{ icon: string; titleEn: string; titleAr: string; descriptionEn: string; descriptionAr: string }>,
    cta: { titleEn: 'Still Have Questions?', titleAr: 'لا تزال لديك أسئلة؟', descriptionEn: '', descriptionAr: '', phone: '', buttonTextEn: 'Send a Message', buttonTextAr: 'أرسل رسالة', buttonLink: '/contact' },
  };

  const [content, setContent] = useState(defaultVal);
  const save = useSaveContent('homepage_why_choose_us');

  useEffect(() => {
    const parsed = parseCmsValue(data, defaultVal);
    // Migrate old single-language fields
    const migrated = {
      badgeEn: parsed.badgeEn || parsed.badge || defaultVal.badgeEn,
      badgeAr: parsed.badgeAr || defaultVal.badgeAr,
      titleEn: parsed.titleEn || parsed.title || defaultVal.titleEn,
      titleAr: parsed.titleAr || defaultVal.titleAr,
      descriptionEn: parsed.descriptionEn || parsed.description || defaultVal.descriptionEn,
      descriptionAr: parsed.descriptionAr || defaultVal.descriptionAr,
      reasons: (parsed.reasons || []).map((r: any) => ({
        icon: r.icon || '⭐',
        titleEn: r.titleEn || r.title || '',
        titleAr: r.titleAr || '',
        descriptionEn: r.descriptionEn || r.description || '',
        descriptionAr: r.descriptionAr || '',
      })),
      cta: {
        titleEn: parsed.cta?.titleEn || parsed.cta?.title || defaultVal.cta.titleEn,
        titleAr: parsed.cta?.titleAr || defaultVal.cta.titleAr,
        descriptionEn: parsed.cta?.descriptionEn || parsed.cta?.description || defaultVal.cta.descriptionEn,
        descriptionAr: parsed.cta?.descriptionAr || defaultVal.cta.descriptionAr,
        phone: parsed.cta?.phone || defaultVal.cta.phone,
        buttonTextEn: parsed.cta?.buttonTextEn || parsed.cta?.buttonText || defaultVal.cta.buttonTextEn,
        buttonTextAr: parsed.cta?.buttonTextAr || defaultVal.cta.buttonTextAr,
        buttonLink: parsed.cta?.buttonLink || defaultVal.cta.buttonLink,
      },
    };
    setContent(migrated);
  }, [data]);

  const updateReason = (i: number, field: string, value: string) => {
    const reasons = [...content.reasons];
    (reasons[i] as any)[field] = value;
    setContent({ ...content, reasons });
  };

  return (
    <div className="space-y-6">
      <Card padding="lg" className="space-y-4">
        <h3 className="font-semibold text-dark-900">Section Header</h3>
        <BilingualInput labelEn="Badge (English)" labelAr="Badge (Arabic)" valueEn={content.badgeEn} valueAr={content.badgeAr} onChangeEn={(v) => setContent({ ...content, badgeEn: v })} onChangeAr={(v) => setContent({ ...content, badgeAr: v })} placeholder="Badge text" />
        <BilingualInput labelEn="Title (English)" labelAr="Title (Arabic)" valueEn={content.titleEn} valueAr={content.titleAr} onChangeEn={(v) => setContent({ ...content, titleEn: v })} onChangeAr={(v) => setContent({ ...content, titleAr: v })} placeholder="Section title" />
        <BilingualInput labelEn="Description (English)" labelAr="Description (Arabic)" valueEn={content.descriptionEn} valueAr={content.descriptionAr} onChangeEn={(v) => setContent({ ...content, descriptionEn: v })} onChangeAr={(v) => setContent({ ...content, descriptionAr: v })} placeholder="Section description" multiline />
      </Card>

      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-dark-900">Reasons</h3>
          <Button size="sm" variant="outline" leftIcon={<HiOutlinePlus size={16} />}
            onClick={() => setContent({ ...content, reasons: [...content.reasons, { icon: '⭐', titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '' }] })}>
            Add Reason
          </Button>
        </div>

        {content.reasons.map((reason, i) => (
          <div key={i} className="p-4 bg-beige-50 rounded-lg space-y-3">
            <div className="flex gap-3 items-center">
              <input className="w-16 px-2 py-2 border border-beige-300 rounded-lg text-center text-xl" value={reason.icon} onChange={(e) => updateReason(i, 'icon', e.target.value)} placeholder="Icon" />
              <span className="text-sm font-medium text-dark-700 flex-1">Reason #{i + 1}</span>
              <button type="button" onClick={() => setContent({ ...content, reasons: content.reasons.filter((_: any, j: number) => j !== i) })} className="text-red-500 hover:text-red-700 p-1" title="Remove">
                <HiOutlineX size={18} />
              </button>
            </div>
            <BilingualInput labelEn="Title (English)" labelAr="Title (Arabic)" valueEn={reason.titleEn} valueAr={reason.titleAr} onChangeEn={(v) => updateReason(i, 'titleEn', v)} onChangeAr={(v) => updateReason(i, 'titleAr', v)} placeholder="Reason title" />
            <BilingualInput labelEn="Description (English)" labelAr="Description (Arabic)" valueEn={reason.descriptionEn} valueAr={reason.descriptionAr} onChangeEn={(v) => updateReason(i, 'descriptionEn', v)} onChangeAr={(v) => updateReason(i, 'descriptionAr', v)} placeholder="Reason description" multiline />
          </div>
        ))}
      </Card>

      <Card padding="lg" className="space-y-4">
        <h3 className="font-semibold text-dark-900">CTA Banner</h3>
        <BilingualInput labelEn="CTA Title (English)" labelAr="CTA Title (Arabic)" valueEn={content.cta.titleEn} valueAr={content.cta.titleAr} onChangeEn={(v) => setContent({ ...content, cta: { ...content.cta, titleEn: v } })} onChangeAr={(v) => setContent({ ...content, cta: { ...content.cta, titleAr: v } })} placeholder="CTA title" />
        <BilingualInput labelEn="CTA Description (English)" labelAr="CTA Description (Arabic)" valueEn={content.cta.descriptionEn} valueAr={content.cta.descriptionAr} onChangeEn={(v) => setContent({ ...content, cta: { ...content.cta, descriptionEn: v } })} onChangeAr={(v) => setContent({ ...content, cta: { ...content.cta, descriptionAr: v } })} placeholder="CTA description" multiline />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone Number" value={content.cta.phone} onChange={(e: any) => setContent({ ...content, cta: { ...content.cta, phone: e.target.value } })} />
          <Input label="Button Link" value={content.cta.buttonLink} onChange={(e: any) => setContent({ ...content, cta: { ...content.cta, buttonLink: e.target.value } })} />
        </div>
        <BilingualInput labelEn="Button Text (English)" labelAr="Button Text (Arabic)" valueEn={content.cta.buttonTextEn} valueAr={content.cta.buttonTextAr} onChangeEn={(v) => setContent({ ...content, cta: { ...content.cta, buttonTextEn: v } })} onChangeAr={(v) => setContent({ ...content, cta: { ...content.cta, buttonTextAr: v } })} placeholder="Button label" />
      </Card>

      <Button leftIcon={<HiOutlineSave size={16} />} onClick={() => save.mutate(content)} isLoading={save.isPending}>
        Save Why Choose Us
      </Button>
    </div>
  );
}

// ========== NEWSLETTER EDITOR ==========

function NewsletterEditor({ data }: { data: any }) {
  const defaultVal = {
    badgeEn: 'Newsletter', badgeAr: 'النشرة الإخبارية',
    titleEn: 'Get 10% Off Your First Order', titleAr: 'احصل على خصم 10% على طلبك الأول',
    descriptionEn: '', descriptionAr: '',
    benefits: [] as Array<{ icon: string; titleEn: string; titleAr: string; descriptionEn: string; descriptionAr: string }>,
    formTitleEn: 'Join Our Community', formTitleAr: 'انضم إلى مجتمعنا',
    subscriberTextEn: 'Over 10,000+ subscribers already', subscriberTextAr: 'أكثر من 10,000 مشترك بالفعل',
    buttonTextEn: 'Subscribe & Get 10% Off', buttonTextAr: 'اشترك واحصل على خصم 10%',
  };

  const [content, setContent] = useState(defaultVal);
  const save = useSaveContent('homepage_newsletter');

  useEffect(() => {
    const parsed = parseCmsValue(data, defaultVal);
    setContent({
      badgeEn: parsed.badgeEn || parsed.badge || defaultVal.badgeEn,
      badgeAr: parsed.badgeAr || defaultVal.badgeAr,
      titleEn: parsed.titleEn || parsed.title || defaultVal.titleEn,
      titleAr: parsed.titleAr || defaultVal.titleAr,
      descriptionEn: parsed.descriptionEn || parsed.description || defaultVal.descriptionEn,
      descriptionAr: parsed.descriptionAr || defaultVal.descriptionAr,
      benefits: (parsed.benefits || []).map((b: any) => ({
        icon: b.icon || '⭐',
        titleEn: b.titleEn || b.title || '',
        titleAr: b.titleAr || '',
        descriptionEn: b.descriptionEn || b.description || '',
        descriptionAr: b.descriptionAr || '',
      })),
      formTitleEn: parsed.formTitleEn || parsed.formTitle || defaultVal.formTitleEn,
      formTitleAr: parsed.formTitleAr || defaultVal.formTitleAr,
      subscriberTextEn: parsed.subscriberTextEn || parsed.subscriberText || defaultVal.subscriberTextEn,
      subscriberTextAr: parsed.subscriberTextAr || defaultVal.subscriberTextAr,
      buttonTextEn: parsed.buttonTextEn || parsed.buttonText || defaultVal.buttonTextEn,
      buttonTextAr: parsed.buttonTextAr || defaultVal.buttonTextAr,
    });
  }, [data]);

  const updateBenefit = (i: number, field: string, value: string) => {
    const benefits = [...content.benefits];
    (benefits[i] as any)[field] = value;
    setContent({ ...content, benefits });
  };

  return (
    <div className="space-y-6">
      <Card padding="lg" className="space-y-4">
        <h3 className="font-semibold text-dark-900">Newsletter Content</h3>
        <BilingualInput labelEn="Badge (English)" labelAr="Badge (Arabic)" valueEn={content.badgeEn} valueAr={content.badgeAr} onChangeEn={(v) => setContent({ ...content, badgeEn: v })} onChangeAr={(v) => setContent({ ...content, badgeAr: v })} placeholder="Badge" />
        <BilingualInput labelEn="Title (English)" labelAr="Title (Arabic)" valueEn={content.titleEn} valueAr={content.titleAr} onChangeEn={(v) => setContent({ ...content, titleEn: v })} onChangeAr={(v) => setContent({ ...content, titleAr: v })} placeholder="Title" />
        <BilingualInput labelEn="Description (English)" labelAr="Description (Arabic)" valueEn={content.descriptionEn} valueAr={content.descriptionAr} onChangeEn={(v) => setContent({ ...content, descriptionEn: v })} onChangeAr={(v) => setContent({ ...content, descriptionAr: v })} placeholder="Description" multiline />
        <BilingualInput labelEn="Form Title (English)" labelAr="Form Title (Arabic)" valueEn={content.formTitleEn} valueAr={content.formTitleAr} onChangeEn={(v) => setContent({ ...content, formTitleEn: v })} onChangeAr={(v) => setContent({ ...content, formTitleAr: v })} placeholder="Form title" />
        <BilingualInput labelEn="Subscriber Text (English)" labelAr="Subscriber Text (Arabic)" valueEn={content.subscriberTextEn} valueAr={content.subscriberTextAr} onChangeEn={(v) => setContent({ ...content, subscriberTextEn: v })} onChangeAr={(v) => setContent({ ...content, subscriberTextAr: v })} placeholder="Subscriber count text" />
        <BilingualInput labelEn="Button Text (English)" labelAr="Button Text (Arabic)" valueEn={content.buttonTextEn} valueAr={content.buttonTextAr} onChangeEn={(v) => setContent({ ...content, buttonTextEn: v })} onChangeAr={(v) => setContent({ ...content, buttonTextAr: v })} placeholder="Subscribe button" />
      </Card>

      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-dark-900">Benefits</h3>
          <Button size="sm" variant="outline" leftIcon={<HiOutlinePlus size={16} />}
            onClick={() => setContent({ ...content, benefits: [...content.benefits, { icon: '⭐', titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '' }] })}>
            Add Benefit
          </Button>
        </div>
        {content.benefits.map((b: any, i: number) => (
          <div key={i} className="p-4 bg-beige-50 rounded-lg space-y-3">
            <div className="flex gap-3 items-center">
              <input className="w-16 px-2 py-2 border border-beige-300 rounded-lg text-center text-xl" value={b.icon} onChange={(e: any) => updateBenefit(i, 'icon', e.target.value)} placeholder="Icon" />
              <span className="text-sm font-medium text-dark-700 flex-1">Benefit #{i + 1}</span>
              <button type="button" onClick={() => setContent({ ...content, benefits: content.benefits.filter((_: any, j: number) => j !== i) })} className="text-red-500 hover:text-red-700 p-1" title="Remove">
                <HiOutlineX size={18} />
              </button>
            </div>
            <BilingualInput labelEn="Title (English)" labelAr="Title (Arabic)" valueEn={b.titleEn} valueAr={b.titleAr} onChangeEn={(v) => updateBenefit(i, 'titleEn', v)} onChangeAr={(v) => updateBenefit(i, 'titleAr', v)} placeholder="Benefit title" />
            <BilingualInput labelEn="Description (English)" labelAr="Description (Arabic)" valueEn={b.descriptionEn} valueAr={b.descriptionAr} onChangeEn={(v) => updateBenefit(i, 'descriptionEn', v)} onChangeAr={(v) => updateBenefit(i, 'descriptionAr', v)} placeholder="Benefit description" />
          </div>
        ))}
      </Card>

      <Button leftIcon={<HiOutlineSave size={16} />} onClick={() => save.mutate(content)} isLoading={save.isPending}>
        Save Newsletter
      </Button>
    </div>
  );
}

// ========== HERO BADGES EDITOR ==========

function HeroBadgesEditor({ data }: { data: any }) {
  const [items, setItems] = useState<Array<{ icon: string; titleEn: string; titleAr: string; subtitleEn: string; subtitleAr: string }>>([]);
  const save = useSaveContent('homepage_hero_badges');

  useEffect(() => {
    const parsed = parseCmsValue(data, [
      { icon: '🚚', titleEn: 'Free Shipping', titleAr: 'شحن مجاني', subtitleEn: 'On orders over SAR 500', subtitleAr: 'للطلبات فوق 500 ريال' },
      { icon: '🛡️', titleEn: '2-Year Warranty', titleAr: 'ضمان سنتين', subtitleEn: 'On all products', subtitleAr: 'على جميع المنتجات' },
      { icon: '🔒', titleEn: 'Secure Payment', titleAr: 'دفع آمن', subtitleEn: 'Multiple options', subtitleAr: 'خيارات متعددة' },
      { icon: '💬', titleEn: '24/7 Support', titleAr: 'دعم على مدار الساعة', subtitleEn: 'Expert assistance', subtitleAr: 'مساعدة متخصصة' },
    ]);
    setItems(parsed.map((item: any) => ({
      icon: item.icon || '⭐',
      titleEn: item.titleEn || item.title || '',
      titleAr: item.titleAr || '',
      subtitleEn: item.subtitleEn || item.subtitle || '',
      subtitleAr: item.subtitleAr || '',
    })));
  }, [data]);

  const updateItem = (i: number, field: string, value: string) => {
    const n = [...items];
    (n[i] as any)[field] = value;
    setItems(n);
  };

  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">Trust Badges</h3>
        <Button size="sm" variant="outline" leftIcon={<HiOutlinePlus size={16} />}
          onClick={() => setItems([...items, { icon: '⭐', titleEn: '', titleAr: '', subtitleEn: '', subtitleAr: '' }])}>
          Add Badge
        </Button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="p-4 bg-beige-50 rounded-lg space-y-3">
          <div className="flex gap-3 items-center">
            <input className="w-16 px-2 py-2 border border-beige-300 rounded-lg text-center text-xl" value={item.icon} onChange={(e) => updateItem(i, 'icon', e.target.value)} placeholder="Icon" />
            <span className="text-sm font-medium text-dark-700 flex-1">Badge #{i + 1}</span>
            <button type="button" onClick={() => setItems(items.filter((_: any, j: number) => j !== i))} className="text-red-500 hover:text-red-700 p-1" title="Remove">
              <HiOutlineX size={18} />
            </button>
          </div>
          <BilingualInput labelEn="Title (English)" labelAr="Title (Arabic)" valueEn={item.titleEn} valueAr={item.titleAr} onChangeEn={(v) => updateItem(i, 'titleEn', v)} onChangeAr={(v) => updateItem(i, 'titleAr', v)} placeholder="Badge title" />
          <BilingualInput labelEn="Subtitle (English)" labelAr="Subtitle (Arabic)" valueEn={item.subtitleEn} valueAr={item.subtitleAr} onChangeEn={(v) => updateItem(i, 'subtitleEn', v)} onChangeAr={(v) => updateItem(i, 'subtitleAr', v)} placeholder="Badge subtitle" />
        </div>
      ))}

      <Button leftIcon={<HiOutlineSave size={16} />} onClick={() => save.mutate(items)} isLoading={save.isPending}>
        Save Trust Badges
      </Button>
    </Card>
  );
}

// ========== HERO CATEGORIES EDITOR ==========

function HeroCategoriesEditor({ data }: { data: any }) {
  const [items, setItems] = useState<Array<{ emoji: string; labelEn: string; labelAr: string; href: string }>>([]);
  const save = useSaveContent('homepage_hero_categories');

  useEffect(() => {
    const parsed = parseCmsValue(data, [
      { emoji: '🧠', labelEn: 'Sensory', labelAr: 'حسي', href: '/categories/sensory-toys' },
      { emoji: '✋', labelEn: 'Motor Skills', labelAr: 'مهارات حركية', href: '/categories/fine-motor-skills' },
      { emoji: '💬', labelEn: 'Speech', labelAr: 'نطق', href: '/categories/speech-communication' },
      { emoji: '🧩', labelEn: 'Cognitive', labelAr: 'إدراكي', href: '/categories/cognitive-development' },
    ]);
    setItems(parsed.map((item: any) => ({
      emoji: item.emoji || '📦',
      labelEn: item.labelEn || item.label || '',
      labelAr: item.labelAr || '',
      href: item.href || '',
    })));
  }, [data]);

  const updateItem = (i: number, field: string, value: string) => {
    const n = [...items];
    (n[i] as any)[field] = value;
    setItems(n);
  };

  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">Quick Categories</h3>
        <Button size="sm" variant="outline" leftIcon={<HiOutlinePlus size={16} />}
          onClick={() => setItems([...items, { emoji: '📦', labelEn: '', labelAr: '', href: '' }])}>
          Add Category
        </Button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="p-4 bg-beige-50 rounded-lg space-y-3">
          <div className="flex gap-3 items-center">
            <input className="w-16 px-2 py-2 border border-beige-300 rounded-lg text-center text-xl" value={item.emoji} onChange={(e) => updateItem(i, 'emoji', e.target.value)} placeholder="Emoji" />
            <input className="flex-1 px-3 py-2 border border-beige-300 rounded-lg text-sm" value={item.href} onChange={(e) => updateItem(i, 'href', e.target.value)} placeholder="/categories/..." />
            <button type="button" onClick={() => setItems(items.filter((_: any, j: number) => j !== i))} className="text-red-500 hover:text-red-700 p-1" title="Remove">
              <HiOutlineX size={18} />
            </button>
          </div>
          <BilingualInput labelEn="Label (English)" labelAr="Label (Arabic)" valueEn={item.labelEn} valueAr={item.labelAr} onChangeEn={(v) => updateItem(i, 'labelEn', v)} onChangeAr={(v) => updateItem(i, 'labelAr', v)} placeholder="Category label" />
        </div>
      ))}

      <Button leftIcon={<HiOutlineSave size={16} />} onClick={() => save.mutate(items)} isLoading={save.isPending}>
        Save Categories
      </Button>
    </Card>
  );
}

// ========== HERO PROMOS EDITOR ==========

function HeroPromosEditor({ data }: { data: any }) {
  const [items, setItems] = useState<Array<{ emoji: string; titleEn: string; titleAr: string; subtitleEn: string; subtitleAr: string; href: string; color: string }>>([]);
  const save = useSaveContent('homepage_hero_promos');

  useEffect(() => {
    const parsed = parseCmsValue(data, [
      { emoji: '🔥', titleEn: 'Flash Deals', titleAr: 'عروض سريعة', subtitleEn: 'Up to 50% off', subtitleAr: 'خصم حتى 50%', href: '/deals', color: 'from-primary-500 to-primary-600' },
      { emoji: '✨', titleEn: 'New Arrivals', titleAr: 'وصل حديثاً', subtitleEn: 'Latest products', subtitleAr: 'أحدث المنتجات', href: '/products?new=true', color: 'from-dark-800 to-dark-900' },
      { emoji: '📦', titleEn: 'All Categories', titleAr: 'جميع الفئات', subtitleEn: 'Browse collection', subtitleAr: 'تصفح المجموعة', href: '/categories', color: '' },
      { emoji: '⭐', titleEn: 'Best Sellers', titleAr: 'الأكثر مبيعاً', subtitleEn: 'Top rated items', subtitleAr: 'المنتجات الأعلى تقييماً', href: '/products?featured=true', color: '' },
    ]);
    setItems(parsed.map((item: any) => ({
      emoji: item.emoji || '🎉',
      titleEn: item.titleEn || item.title || '',
      titleAr: item.titleAr || '',
      subtitleEn: item.subtitleEn || item.subtitle || '',
      subtitleAr: item.subtitleAr || '',
      href: item.href || '',
      color: item.color || '',
    })));
  }, [data]);

  const updateItem = (i: number, field: string, value: string) => {
    const n = [...items];
    (n[i] as any)[field] = value;
    setItems(n);
  };

  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">Promo Cards</h3>
        <Button size="sm" variant="outline" leftIcon={<HiOutlinePlus size={16} />}
          onClick={() => setItems([...items, { emoji: '🎉', titleEn: '', titleAr: '', subtitleEn: '', subtitleAr: '', href: '', color: '' }])}>
          Add Card
        </Button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="p-4 bg-beige-50 rounded-lg space-y-3">
          <div className="flex gap-3 items-center">
            <input className="w-16 px-2 py-2 border border-beige-300 rounded-lg text-center text-xl" value={item.emoji} onChange={(e) => updateItem(i, 'emoji', e.target.value)} placeholder="Emoji" />
            <span className="text-sm font-medium text-dark-700 flex-1">Promo #{i + 1}</span>
            <button type="button" onClick={() => setItems(items.filter((_: any, j: number) => j !== i))} className="text-red-500 hover:text-red-700 p-1" title="Remove">
              <HiOutlineX size={18} />
            </button>
          </div>
          <BilingualInput labelEn="Title (English)" labelAr="Title (Arabic)" valueEn={item.titleEn} valueAr={item.titleAr} onChangeEn={(v) => updateItem(i, 'titleEn', v)} onChangeAr={(v) => updateItem(i, 'titleAr', v)} placeholder="Promo title" />
          <BilingualInput labelEn="Subtitle (English)" labelAr="Subtitle (Arabic)" valueEn={item.subtitleEn} valueAr={item.subtitleAr} onChangeEn={(v) => updateItem(i, 'subtitleEn', v)} onChangeAr={(v) => updateItem(i, 'subtitleAr', v)} placeholder="Promo subtitle" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">Link</label>
              <input className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm" value={item.href} onChange={(e) => updateItem(i, 'href', e.target.value)} placeholder="/deals" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">Gradient Color</label>
              <input className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm" value={item.color} onChange={(e) => updateItem(i, 'color', e.target.value)} placeholder="from-red-500 to-orange-500" />
            </div>
          </div>
        </div>
      ))}

      <Button leftIcon={<HiOutlineSave size={16} />} onClick={() => save.mutate(items)} isLoading={save.isPending}>
        Save Promo Cards
      </Button>
    </Card>
  );
}
