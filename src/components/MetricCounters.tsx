import React from 'react';
import { UrgencyTier } from '../types';

interface MetricCountersProps {
  freshCount: number;
  soonCount: number;
  criticalCount: number;
  activeTier: UrgencyTier | 'all';
  onSelectTier: (tier: UrgencyTier | 'all') => void;
}

export const MetricCounters: React.FC<MetricCountersProps> = ({
  freshCount,
  soonCount,
  criticalCount,
  activeTier,
  onSelectTier,
}) => {
  const cells: {
    tier: UrgencyTier;
    label: string;
    sublabel: string;
    count: number;
    numColor: string;
    activeRing: string;
    activeBg: string;
  }[] = [
    {
      tier: 'fresh',
      label: 'Fresh',
      sublabel: '4+ days left',
      count: freshCount,
      numColor: 'text-[#059669]',
      activeRing: 'ring-2 ring-[#059669]/30',
      activeBg: 'bg-[#ECFDF5]/60',
    },
    {
      tier: 'soon',
      label: 'Use Soon',
      sublabel: '0–3 days left',
      count: soonCount,
      numColor: 'text-[#D97706]',
      activeRing: 'ring-2 ring-[#D97706]/30',
      activeBg: 'bg-[#FFFBEB]/80',
    },
    {
      tier: 'critical',
      label: 'Critical',
      sublabel: 'Check or clear',
      count: criticalCount,
      numColor: 'text-[#DC2626]',
      activeRing: 'ring-2 ring-[#DC2626]/30',
      activeBg: 'bg-[#FEF2F2]/70',
    },
  ];

  return (
    <section
      aria-label="Kitchen shelf-life summary"
      className="bg-white border border-[#E2E8F0] rounded-2xl elevation-card overflow-hidden"
    >
      <div className="grid grid-cols-3 divide-x divide-[#E2E8F0]">
        {cells.map((cell) => {
          const isSelected = activeTier === cell.tier;
          return (
            <button
              key={cell.tier}
              type="button"
              onClick={() => onSelectTier(isSelected ? 'all' : cell.tier)}
              aria-pressed={isSelected}
              className={`group text-left px-4 py-4 sm:px-6 sm:py-5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#059669] ${
                isSelected ? `${cell.activeBg} ${cell.activeRing}` : 'hover:bg-[#FBFBF9]'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={`font-display text-[28px] sm:text-[32px] leading-9 font-bold tracking-[-0.02em] tabular-nums ${cell.numColor}`}
                >
                  {cell.count}
                </span>
                {isSelected && (
                  <span className="hidden sm:inline text-[11px] font-bold text-[#0F172A] tracking-wide">
                    Filtered
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs font-bold tracking-[0.04em] uppercase text-[#0F172A]">
                {cell.label}
              </div>
              <div className="mt-0.5 text-[11px] font-medium text-[#64748B] truncate">
                {cell.sublabel}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
