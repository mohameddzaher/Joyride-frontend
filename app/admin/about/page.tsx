'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiOutlineX, HiOutlinePlus, HiOutlineSave } from 'react-icons/hi';
import { Button, Input, Card } from '@/components/ui';
import { cmsApi, adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

type SectionKey = 'about_team_members' | 'about_stats' | 'about_story' | 'about_values';

const sections: { key: SectionKey; label: string }[] = [
  { key: 'about_team_members', label: 'Team Members' },
  { key: 'about_stats', label: 'Stats' },
  { key: 'about_story', label: 'Story / Mission' },
  { key: 'about_values', label: 'Values' },
];

export default function AboutContentPage() {
  const [activeTab, setActiveTab] = useState<SectionKey>('about_team_members');

  const { data: cmsData, isLoading } = useQuery({
    queryKey: ['cms-about-all'],
    queryFn: () =>
      cmsApi.getMultiple(sections.map((s) => s.key)),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-dark-900">About Page Content</h1>
        <p className="text-dark-500 mt-1">
          Manage team members, stats, story, and values displayed on the About page.
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
          {activeTab === 'about_team_members' && (
            <TeamMembersEditor data={cmsData?.about_team_members} />
          )}
          {activeTab === 'about_stats' && (
            <StatsEditor data={cmsData?.about_stats} />
          )}
          {activeTab === 'about_story' && (
            <StoryEditor data={cmsData?.about_story} />
          )}
          {activeTab === 'about_values' && (
            <ValuesEditor data={cmsData?.about_values} />
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
      queryClient.invalidateQueries({ queryKey: ['cms-about-all'] });
      const dashKey = key.replace(/_/g, '-');
      queryClient.invalidateQueries({ queryKey: [`cms-${key}`] });
      queryClient.invalidateQueries({ queryKey: [`cms-${dashKey}`] });
      toast.success('Saved successfully');
    },
    onError: () => toast.error('Failed to save'),
  });
}

// ========== TEAM MEMBERS EDITOR ==========

interface TeamMember {
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  image: string;
  linkedinUrl: string;
  snapchatUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
}

const defaultTeam: TeamMember[] = [
  {
    nameAr: '',
    nameEn: '',
    roleAr: '',
    roleEn: '',
    image: '',
    linkedinUrl: '',
    snapchatUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
  },
];

function TeamMembersEditor({ data }: { data: any }) {
  const [items, setItems] = useState<TeamMember[]>([]);
  const save = useSaveContent('about_team_members');

  useEffect(() => {
    setItems(parseCmsValue(data, defaultTeam));
  }, [data]);

  const updateItem = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">Team Members</h3>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<HiOutlinePlus size={16} />}
          onClick={() =>
            setItems([
              ...items,
              { nameAr: '', nameEn: '', roleAr: '', roleEn: '', image: '', linkedinUrl: '', snapchatUrl: '', instagramUrl: '', tiktokUrl: '' },
            ])
          }
        >
          Add Member
        </Button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="p-4 bg-beige-50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-dark-700">
              Member {i + 1}{item.nameEn ? ` - ${item.nameEn}` : ''}
            </span>
            <button
              type="button"
              onClick={() => setItems(items.filter((_, j) => j !== i))}
              className="text-red-500 hover:text-red-700 p-1"
              title="Remove"
            >
              <HiOutlineX size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">Name (English)</label>
              <input
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                value={item.nameEn}
                onChange={(e) => updateItem(i, 'nameEn', e.target.value)}
                placeholder="e.g. Mohamed Zaher"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">Name (Arabic)</label>
              <input
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                dir="rtl"
                value={item.nameAr}
                onChange={(e) => updateItem(i, 'nameAr', e.target.value)}
                placeholder="e.g. محمد زاهر"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">Role (English)</label>
              <input
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                value={item.roleEn}
                onChange={(e) => updateItem(i, 'roleEn', e.target.value)}
                placeholder="e.g. Co-Founder & CEO"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">Role (Arabic)</label>
              <input
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                dir="rtl"
                value={item.roleAr}
                onChange={(e) => updateItem(i, 'roleAr', e.target.value)}
                placeholder="e.g. شريك مؤسس والرئيس التنفيذي"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-500 mb-1">Image URL</label>
            <input
              className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
              value={item.image}
              onChange={(e) => updateItem(i, 'image', e.target.value)}
              placeholder="/images/founders/photo.png"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">LinkedIn URL</label>
              <input
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                value={item.linkedinUrl}
                onChange={(e) => updateItem(i, 'linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">Snapchat URL</label>
              <input
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                value={item.snapchatUrl}
                onChange={(e) => updateItem(i, 'snapchatUrl', e.target.value)}
                placeholder="https://snapchat.com/add/..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">Instagram URL</label>
              <input
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                value={item.instagramUrl}
                onChange={(e) => updateItem(i, 'instagramUrl', e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">TikTok URL</label>
              <input
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                value={item.tiktokUrl}
                onChange={(e) => updateItem(i, 'tiktokUrl', e.target.value)}
                placeholder="https://tiktok.com/@..."
              />
            </div>
          </div>
        </div>
      ))}

      <Button leftIcon={<HiOutlineSave size={16} />} onClick={() => save.mutate(items)} isLoading={save.isPending}>
        Save Team Members
      </Button>
    </Card>
  );
}

// ========== STATS EDITOR ==========

interface AboutStat {
  value: string;
  label: string;
}

const defaultStats: AboutStat[] = [
  { value: '1K+', label: 'عملاء سعداء' },
  { value: '500+', label: 'منتجات' },
  { value: '30+', label: 'علامات تجارية' },
  { value: '4.8', label: 'تقييم العملاء' },
];

function StatsEditor({ data }: { data: any }) {
  const [items, setItems] = useState<AboutStat[]>([]);
  const save = useSaveContent('about_stats');

  useEffect(() => {
    setItems(parseCmsValue(data, defaultStats));
  }, [data]);

  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">Stats</h3>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<HiOutlinePlus size={16} />}
          onClick={() => setItems([...items, { value: '', label: '' }])}
        >
          Add Stat
        </Button>
      </div>

      <p className="text-xs text-dark-400">
        Enter the label as plain text (e.g. عملاء سعداء / Happy Customers). The value is displayed as-is (e.g. 1K+, 500+, 4.8).
      </p>

      {items.map((item, i) => (
        <div key={i} className="flex gap-3 items-center p-4 bg-beige-50 rounded-lg">
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-dark-500 mb-1">Value</label>
                <input
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                  value={item.value}
                  onChange={(e) => {
                    const n = [...items];
                    n[i] = { ...n[i], value: e.target.value };
                    setItems(n);
                  }}
                  placeholder="e.g. 1K+"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-dark-500 mb-1">Label</label>
                <input
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                  value={item.label}
                  onChange={(e) => {
                    const n = [...items];
                    n[i] = { ...n[i], label: e.target.value };
                    setItems(n);
                  }}
                  placeholder="e.g. عملاء سعداء / Happy Customers"
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setItems(items.filter((_, j) => j !== i))}
            className="text-red-500 hover:text-red-700 p-1"
            title="Remove"
          >
            <HiOutlineX size={18} />
          </button>
        </div>
      ))}

      <Button leftIcon={<HiOutlineSave size={16} />} onClick={() => save.mutate(items)} isLoading={save.isPending}>
        Save Stats
      </Button>
    </Card>
  );
}

// ========== STORY / MISSION EDITOR ==========

interface StoryData {
  titleAr: string;
  titleEn: string;
  paragraphs: { ar: string; en: string }[];
}

const defaultStory: StoryData = {
  titleAr: '',
  titleEn: '',
  paragraphs: [{ ar: '', en: '' }],
};

function StoryEditor({ data }: { data: any }) {
  const [story, setStory] = useState<StoryData>(defaultStory);
  const save = useSaveContent('about_story');

  useEffect(() => {
    const parsed = parseCmsValue(data, defaultStory);
    setStory({ ...defaultStory, ...parsed, paragraphs: parsed.paragraphs?.length ? parsed.paragraphs : defaultStory.paragraphs });
  }, [data]);

  const updateParagraph = (index: number, lang: 'ar' | 'en', value: string) => {
    const updated = [...story.paragraphs];
    updated[index] = { ...updated[index], [lang]: value };
    setStory({ ...story, paragraphs: updated });
  };

  return (
    <Card padding="lg" className="space-y-4">
      <h3 className="font-semibold text-dark-900">Story / Mission Section</h3>
      <p className="text-xs text-dark-400">
        Edit the story/mission title and paragraphs. Leave empty to use the default translation keys.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-dark-500 mb-1">Title (English)</label>
          <input
            className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
            value={story.titleEn}
            onChange={(e) => setStory({ ...story, titleEn: e.target.value })}
            placeholder="e.g. Our Story"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-dark-500 mb-1">Title (Arabic)</label>
          <input
            className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
            dir="rtl"
            value={story.titleAr}
            onChange={(e) => setStory({ ...story, titleAr: e.target.value })}
            placeholder="e.g. قصتنا"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-dark-700">Paragraphs</label>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<HiOutlinePlus size={16} />}
            onClick={() => setStory({ ...story, paragraphs: [...story.paragraphs, { ar: '', en: '' }] })}
          >
            Add Paragraph
          </Button>
        </div>

        {story.paragraphs.map((p, i) => (
          <div key={i} className="p-4 bg-beige-50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-dark-500">Paragraph {i + 1}</span>
              <button
                type="button"
                onClick={() => setStory({ ...story, paragraphs: story.paragraphs.filter((_, j) => j !== i) })}
                className="text-red-500 hover:text-red-700 p-1"
                title="Remove"
              >
                <HiOutlineX size={18} />
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">English</label>
              <textarea
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                rows={3}
                value={p.en}
                onChange={(e) => updateParagraph(i, 'en', e.target.value)}
                placeholder="Paragraph text in English..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">Arabic</label>
              <textarea
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                rows={3}
                dir="rtl"
                value={p.ar}
                onChange={(e) => updateParagraph(i, 'ar', e.target.value)}
                placeholder="نص الفقرة بالعربي..."
              />
            </div>
          </div>
        ))}
      </div>

      <Button leftIcon={<HiOutlineSave size={16} />} onClick={() => save.mutate(story)} isLoading={save.isPending}>
        Save Story
      </Button>
    </Card>
  );
}

// ========== VALUES EDITOR ==========

interface AboutValue {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

const defaultValuesAdmin: AboutValue[] = [
  { titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '' },
];

function ValuesEditor({ data }: { data: any }) {
  const [items, setItems] = useState<AboutValue[]>([]);
  const save = useSaveContent('about_values');

  useEffect(() => {
    const parsed = parseCmsValue(data, defaultValuesAdmin);
    setItems(Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultValuesAdmin);
  }, [data]);

  const updateItem = (index: number, field: keyof AboutValue, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">Values</h3>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<HiOutlinePlus size={16} />}
          onClick={() =>
            setItems([...items, { titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '' }])
          }
        >
          Add Value
        </Button>
      </div>

      <p className="text-xs text-dark-400">
        Edit the value cards shown on the About page. Icons are assigned automatically in order (shield, truck, heart, refresh). Leave empty to use the default translation keys.
      </p>

      {items.map((item, i) => (
        <div key={i} className="p-4 bg-beige-50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-dark-700">
              Value {i + 1}{item.titleEn ? ` - ${item.titleEn}` : ''}
            </span>
            <button
              type="button"
              onClick={() => setItems(items.filter((_, j) => j !== i))}
              className="text-red-500 hover:text-red-700 p-1"
              title="Remove"
            >
              <HiOutlineX size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">Title (English)</label>
              <input
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                value={item.titleEn}
                onChange={(e) => updateItem(i, 'titleEn', e.target.value)}
                placeholder="e.g. Quality Assurance"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">Title (Arabic)</label>
              <input
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                dir="rtl"
                value={item.titleAr}
                onChange={(e) => updateItem(i, 'titleAr', e.target.value)}
                placeholder="e.g. ضمان الجودة"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">Description (English)</label>
              <textarea
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                rows={2}
                value={item.descriptionEn}
                onChange={(e) => updateItem(i, 'descriptionEn', e.target.value)}
                placeholder="Description in English..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">Description (Arabic)</label>
              <textarea
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                rows={2}
                dir="rtl"
                value={item.descriptionAr}
                onChange={(e) => updateItem(i, 'descriptionAr', e.target.value)}
                placeholder="الوصف بالعربي..."
              />
            </div>
          </div>
        </div>
      ))}

      <Button leftIcon={<HiOutlineSave size={16} />} onClick={() => save.mutate(items)} isLoading={save.isPending}>
        Save Values
      </Button>
    </Card>
  );
}
