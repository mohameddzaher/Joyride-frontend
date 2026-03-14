'use client';

import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export type DevelopmentalBadgeType =
  | 'autism-support'
  | 'speech-development'
  | 'fine-motor-skills'
  | 'sensory-play'
  | 'early-learning'
  | 'cognitive-development'
  | 'montessori'
  | 'therapy-tool'
  | 'safety-tested';

interface DevelopmentalBadgeProps {
  type: DevelopmentalBadgeType;
  size?: 'sm' | 'md';
  className?: string;
}

const badgeConfig: Record<DevelopmentalBadgeType, { icon: string; colorClass: string; translationKey: string }> = {
  'autism-support': {
    icon: '🧩',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
    translationKey: 'badges.autismSupport',
  },
  'speech-development': {
    icon: '💬',
    colorClass: 'bg-purple-50 text-purple-700 border-purple-200',
    translationKey: 'badges.speechDevelopment',
  },
  'fine-motor-skills': {
    icon: '✋',
    colorClass: 'bg-green-50 text-green-700 border-green-200',
    translationKey: 'badges.fineMotorSkills',
  },
  'sensory-play': {
    icon: '🧠',
    colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
    translationKey: 'badges.sensoryPlay',
  },
  'early-learning': {
    icon: '⭐',
    colorClass: 'bg-pink-50 text-pink-700 border-pink-200',
    translationKey: 'badges.earlyLearning',
  },
  'cognitive-development': {
    icon: '🎯',
    colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    translationKey: 'badges.cognitiveDev',
  },
  'montessori': {
    icon: '🌿',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    translationKey: 'badges.montessori',
  },
  'therapy-tool': {
    icon: '🩺',
    colorClass: 'bg-teal-50 text-teal-700 border-teal-200',
    translationKey: 'badges.therapyTool',
  },
  'safety-tested': {
    icon: '🛡️',
    colorClass: 'bg-slate-50 text-slate-700 border-slate-200',
    translationKey: 'badges.safetyTested',
  },
};

export function DevelopmentalBadge({ type, size = 'md', className }: DevelopmentalBadgeProps) {
  const { t } = useI18n();
  const config = badgeConfig[type];

  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.colorClass,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        className
      )}
    >
      <span>{config.icon}</span>
      <span>{t(config.translationKey)}</span>
    </span>
  );
}

export function DevelopmentalBadgeGroup({
  types,
  size = 'sm',
  className,
}: {
  types: DevelopmentalBadgeType[];
  size?: 'sm' | 'md';
  className?: string;
}) {
  if (!types || types.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {types.map((type) => (
        <DevelopmentalBadge key={type} type={type} size={size} />
      ))}
    </div>
  );
}

export default DevelopmentalBadge;
