import React from 'react';
import {
  LayoutGrid,
  Flame,
  ShoppingBasket,
  BarChart3,
  Plus,
  Refrigerator,
  Snowflake,
  Archive,
} from 'lucide-react';
import { AppScreen, StorageLocation } from '../types';

interface SidebarProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  activeLocation: StorageLocation | 'All';
  onSelectLocation: (loc: StorageLocation | 'All') => void;
  locationCounts: Record<StorageLocation | 'All', number>;
  urgentCount: number;
  shoppingCount: number;
  onOpenAdd: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  onNavigate,
  activeLocation,
  onSelectLocation,
  locationCounts,
  urgentCount,
  shoppingCount,
  onOpenAdd,
}) => {
  const navItems: {
    id: AppScreen;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeTone?: 'amber' | 'neutral';
  }[] = [
    { id: 'inventory', label: 'Pantry & Fridge', icon: LayoutGrid },
    {
      id: 'use-soon',
      label: 'Use Soon',
      icon: Flame,
      badge: urgentCount > 0 ? urgentCount : undefined,
      badgeTone: 'amber',
    },
    {
      id: 'shopping',
      label: 'Shopping List',
      icon: ShoppingBasket,
      badge: shoppingCount > 0 ? shoppingCount : undefined,
      badgeTone: 'neutral',
    },
    { id: 'impact', label: 'Savings Log', icon: BarChart3 },
  ];

  const storageZones: {
    id: StorageLocation | 'All';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'All', label: 'All Zones', icon: LayoutGrid },
    { id: 'Fridge', label: 'Fridge', icon: Refrigerator },
    { id: 'Freezer', label: 'Freezer', icon: Snowflake },
    { id: 'Pantry', label: 'Pantry', icon: Archive },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[#E2E8F0] bg-white min-h-screen sticky top-0 h-screen p-5 justify-between">
      <div>
        {/* Brand Wordmark */}
        <div className="px-2 pb-6 border-b border-[#F4F4F0]">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('inventory');
            }}
            className="font-display text-2xl font-bold tracking-[-0.03em] text-[#0F172A] whitespace-nowrap"
          >
            Larder
          </a>
        </div>

        {/* Primary Action */}
        <div className="mt-5">
          <button
            type="button"
            onClick={onOpenAdd}
            className="w-full h-11 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm flex items-center justify-center gap-2 elevation-fab transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#059669]"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Main Screen Links */}
        <nav className="mt-6 space-y-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0F172A] text-white'
                    : 'text-[#64748B] hover:bg-[#F4F4F0] hover:text-[#0F172A]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </span>
                {item.badge !== undefined && (
                  <span
                    className={`tabular-nums text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeTone === 'amber'
                          ? 'bg-[#FFFBEB] text-[#D97706]'
                          : 'bg-[#F4F4F0] text-[#0F172A]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Storage Zones */}
        <div className="mt-8 pt-6 border-t border-[#F4F4F0]">
          <div className="px-3 mb-2 text-xs font-bold text-[#64748B] tracking-[0.04em] uppercase">
            Storage Zones
          </div>
          <div className="space-y-1">
            {storageZones.map((zone) => {
              const Icon = zone.icon;
              const isSelected = activeScreen === 'inventory' && activeLocation === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => {
                    onSelectLocation(zone.id);
                    onNavigate('inventory');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#F4F4F0] text-[#0F172A] font-semibold'
                      : 'text-[#64748B] hover:bg-[#FBFBF9] hover:text-[#0F172A]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{zone.label}</span>
                  </span>
                  <span className="tabular-nums text-xs font-bold text-[#64748B]">
                    {locationCounts[zone.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subtle Household Tip Footer */}
      <div className="pt-4 border-t border-[#F4F4F0] px-2">
        <p className="text-xs text-[#64748B] leading-relaxed">
          Tap any item card to adjust quantity or move it to the freezer to extend shelf life.
        </p>
      </div>
    </aside>
  );
};
