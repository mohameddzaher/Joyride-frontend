'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiOutlineX, HiOutlinePlus, HiOutlineSave } from 'react-icons/hi';
import { Button, Input, Card } from '@/components/ui';
import { cmsApi, adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

type SectionKey = 'about_team_members' | 'about_stats';

const sections: { key: SectionKey; label: string }[] = [
  { key: 'about_team_members', label: 'Team Members' },
  { key: 'about_stats', label: 'Stats' },
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
          Manage team members and stats displayed on the About page.
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
              { nameAr: '', nameEn: '', roleAr: '', roleEn: '', image: '', linkedinUrl: '', snapchatUrl: '' },
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
  labelKey: string;
}

const defaultStats: AboutStat[] = [
  { value: '1K+', labelKey: 'about.statsHappy' },
  { value: '500+', labelKey: 'about.statsProducts' },
  { value: '30+', labelKey: 'about.statsBrands' },
  { value: '4.8', labelKey: 'about.statsRating' },
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
          onClick={() => setItems([...items, { value: '', labelKey: '' }])}
        >
          Add Stat
        </Button>
      </div>

      <p className="text-xs text-dark-400">
        The label key should match a translation key (e.g. about.statsHappy). The value is displayed as-is (e.g. 1K+, 500+, 4.8).
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
                <label className="block text-xs font-medium text-dark-500 mb-1">Label Key</label>
                <input
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
                  value={item.labelKey}
                  onChange={(e) => {
                    const n = [...items];
                    n[i] = { ...n[i], labelKey: e.target.value };
                    setItems(n);
                  }}
                  placeholder="e.g. about.statsHappy"
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
