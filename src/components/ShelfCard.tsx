import React from 'react';
import { InventoryItem } from '../types';
import { formatUrgencyLabel, getDaysRemaining } from '../utils/dates';
import { CategoryIcon } from './CategoryIcon';

interface ShelfCardProps {
  item: InventoryItem;
  onMarkEaten: (item: InventoryItem) => void;
  onSelect: (item: InventoryItem) => void;
}

export const ShelfCard: React.FC<ShelfCardProps> = ({
  item,
  onMarkEaten,
  onSelect,
}) => {
  const days = getDaysRemaining(item.expiresAt);
  const label = formatUrgencyLabel(item.expiresAt, item.hoursRemaining);

  // Match the exact Eat Before badge styles:
  // <= 18h or <0d -> Solid Red (#DC2626)
  // <= 24h or 0-1d -> Solid Dark Amber (#92400E)
  // <= 48h or 2d -> Solid Forest Green (#0B8A3E)
  // 3..14d -> Outlined Dark (#0F172A)
  // > 14d -> Outlined Slate (#64748B)
  let badgeClass = 'bg-white text-[#64748B] border-[#94A3B8]';
  let statusHintColor = 'text-[#64748B]';
  let isUrgentButton = true;

  if (item.hoursRemaining !== undefined && item.hoursRemaining <= 18) {
    badgeClass = 'bg-[#DC2626] text-white border-[#0F172A]';
    statusHintColor = 'text-[#DC2626]';
  } else if (
    (item.hoursRemaining !== undefined && item.hoursRemaining <= 24) ||
    days <= 1
  ) {
    badgeClass = 'bg-[#92400E] text-white border-[#0F172A]';
    statusHintColor = 'text-[#92400E]';
  } else if (
    (item.hoursRemaining !== undefined && item.hoursRemaining <= 48) ||
    days === 2
  ) {
    badgeClass = 'bg-[#0B8A3E] text-white border-[#0F172A]';
    statusHintColor = 'text-[#0B8A3E]';
  } else if (days <= 14) {
    badgeClass = 'bg-white text-[#0F172A] border-[#0F172A]';
    statusHintColor = 'text-[#0B8A3E]';
  } else {
    badgeClass = 'bg-white text-[#475569] border-[#94A3B8]';
    statusHintColor = 'text-[#64748B]';
    isUrgentButton = false;
  }

  const zoneText = item.zoneLabel || item.location.toUpperCase();
  const hintText =
    item.statusHint ||
    (days <= 3 ? 'EAT SOON' : days >= 30 ? 'STABLE STOCK' : 'FRESH STOCK');

  return (
    <article className="bg-white border border-[#0F172A] flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5">
      {/* Top Meta Bar */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center px-1.5 py-0.5 border text-[10px] font-bold tracking-[0.04em] uppercase tabular-nums whitespace-nowrap ${badgeClass}`}
        >
          {label}
        </span>
        <span className="inline-flex items-center px-1.5 py-0.5 border border-[#0F172A]/40 bg-[#F8FAFC] text-[10px] font-bold tracking-[0.04em] uppercase text-[#0F172A] whitespace-nowrap">
          {zoneText}
        </span>
      </div>

      {/* Product Visual Frame */}
      <div className="px-3">
        <button
          type="button"
          onClick={() => onSelect(item)}
          className="w-full h-28 bg-[#F4F4F0] border border-[#CBD5E1] overflow-hidden flex items-center justify-center cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B8A3E]"
          aria-label={`Inspect ${item.name}`}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 p-2">
              <CategoryIcon category={item.category} className="w-12 h-12" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                {item.category}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Item Info */}
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="px-3 pt-2.5 pb-3 text-left cursor-pointer focus-visible:outline-none"
      >
        <div
          className={`text-[10px] font-bold tracking-[0.05em] uppercase ${statusHintColor}`}
        >
          {hintText}
        </div>
        <h3 className="mt-0.5 font-display text-[15px] leading-snug font-bold text-[#0F172A] truncate">
          {item.name}
        </h3>
        <div className="text-xs font-medium text-[#64748B] truncate">
          {item.quantity > 1 ? `${item.quantity} × ` : ''}
          {item.unit}
        </div>
      </button>

      {/* Bottom Price & Action Footer */}
      <div className="px-3 py-2.5 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
        <div className="leading-tight min-w-0">
          <div className="text-[10px] text-[#94A3B8] line-through tabular-nums">
            ₹{Math.round(item.estimatedValue)}
          </div>
          <div className="text-xs font-bold text-[#0B8A3E] tabular-nums truncate">
            {isUrgentButton ? `₹${Math.round(item.estimatedValue)} saved` : 'Safe Stock'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onMarkEaten(item)}
          className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.04em] border transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B8A3E] ${
            isUrgentButton
              ? 'bg-[#0B8A3E] hover:bg-[#065F46] text-white border-[#0F172A]'
              : 'bg-white hover:bg-[#0F172A] hover:text-white text-[#0F172A] border-[#0F172A]'
          }`}
        >
          MARK EATEN
        </button>
      </div>
    </article>
  );
};
