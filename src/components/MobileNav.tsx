import React from 'react';
import {
  LayoutGrid,
  Flame,
  ShoppingBasket,
  BarChart3,
  Plus,
} from 'lucide-react';
import { AppScreen } from '../types';

interface MobileNavProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  urgentCount: number;
  shoppingCount: number;
  onOpenAdd: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeScreen,
  onNavigate,
  urgentCount,
  shoppingCount,
  onOpenAdd,
}) => {
  const tabs: {
    id: AppScreen;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'inventory', label: 'Kitchen', icon: LayoutGrid },
    {
      id: 'use-soon',
      label: 'Use Soon',
      icon: Flame,
      badge: urgentCount > 0 ? urgentCount : undefined,
    },
    {
      id: 'shopping',
      label: 'Shop',
      icon: ShoppingBasket,
      badge: shoppingCount > 0 ? shoppingCount : undefined,
    },
    { id: 'impact', label: 'Savings', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile-only Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={onOpenAdd}
        aria-label="Add food item"
        className="lg:hidden fixed right-4 bottom-20 z-30 h-14 px-5 rounded-full bg-[#059669] hover:bg-[#047857] active:scale-[0.97] text-white font-bold text-sm flex items-center gap-2 elevation-fab transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#059669]"
      >
        <Plus className="w-5 h-5 shrink-0" />
        <span>Add Item</span>
      </button>

      {/* Mobile-only Bottom Navigation Bar (single fixed bar <= 64px height) */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] grid grid-cols-4 items-center px-2"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 rounded-xl transition-colors cursor-pointer ${
                isActive ? 'text-[#059669]' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#D97706] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-bold mt-0.5 tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
