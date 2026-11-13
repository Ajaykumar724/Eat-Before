import React from 'react';
import {
  Apple,
  Milk,
  Fish,
  Croissant,
  Package,
  CupSoda,
  UtensilsCrossed,
  Snowflake,
} from 'lucide-react';
import { FoodCategory } from '../types';

interface CategoryIconProps {
  category: FoodCategory;
  className?: string;
}

const CATEGORY_STYLES: Record<
  FoodCategory,
  { icon: React.ComponentType<{ className?: string }>; bg: string; fg: string }
> = {
  Produce: { icon: Apple, bg: 'bg-[#ECFDF5]', fg: 'text-[#059669]' },
  Dairy: { icon: Milk, bg: 'bg-[#F0F9FF]', fg: 'text-[#0284C7]' },
  'Meat & Fish': { icon: Fish, bg: 'bg-[#FEF2F2]', fg: 'text-[#DC2626]' },
  Bakery: { icon: Croissant, bg: 'bg-[#FFFBEB]', fg: 'text-[#D97706]' },
  'Dry Goods': { icon: Package, bg: 'bg-[#F4F4F0]', fg: 'text-[#475569]' },
  Beverages: { icon: CupSoda, bg: 'bg-[#EEF2FF]', fg: 'text-[#4F46E5]' },
  Leftovers: { icon: UtensilsCrossed, bg: 'bg-[#FFF7ED]', fg: 'text-[#C2410C]' },
  Frozen: { icon: Snowflake, bg: 'bg-[#ECFEFF]', fg: 'text-[#0891B2]' },
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = '' }) => {
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES['Dry Goods'];
  const Icon = style.icon;

  return (
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${style.bg} ${style.fg} ${className}`}
      aria-hidden="true"
    >
      <Icon className="w-5 h-5" />
    </div>
  );
};
