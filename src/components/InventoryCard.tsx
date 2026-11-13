import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Utensils,
  Trash2,
  X,
} from 'lucide-react';
import { DiscardReason, InventoryItem } from '../types';
import { formatShortDate, formatUrgencyLabel, getUrgencyTier } from '../utils/dates';
import { FoodItemVisual } from './FoodItemVisual';

interface InventoryCardProps {
  item: InventoryItem;
  onConsume: (item: InventoryItem) => void;
  onDiscard: (item: InventoryItem, reason: DiscardReason) => void;
  onSelect: (item: InventoryItem) => void;
}

const DISCARD_REASONS: DiscardReason[] = ['Expired', 'Spoiled', 'Other'];

export const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  onConsume,
  onDiscard,
  onSelect,
}) => {
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  const tier = getUrgencyTier(item.expiresAt);
  const urgencyLabel = formatUrgencyLabel(item.expiresAt);

  const stripeColor =
    tier === 'critical'
      ? 'bg-[#DC2626]'
      : tier === 'soon'
        ? 'bg-[#D97706]'
        : 'bg-[#059669]';

  const badgeStyles =
    tier === 'critical'
      ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/25'
      : tier === 'soon'
        ? 'bg-[#FFFBEB] text-[#D97706] border-[#D97706]/25'
        : 'bg-[#ECFDF5] text-[#059669] border-[#059669]/25';

  const UrgencyIcon =
    tier === 'critical' ? AlertTriangle : tier === 'soon' ? Clock : CheckCircle2;

  return (
    <article className="relative bg-white border border-[#E2E8F0] rounded-2xl elevation-card elevation-card-hover transition-all duration-150 overflow-hidden flex flex-col justify-between">
      {/* 4px left urgency accent stripe */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${stripeColor}`}
        aria-hidden="true"
      />

      <div className="p-4 pl-5 flex flex-col gap-3.5 h-full justify-between">
        {/* Top section: clickable to open item details */}
        <button
          type="button"
          onClick={() => onSelect(item)}
          className="w-full text-left flex items-start gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] rounded-lg"
        >
          <FoodItemVisual
            category={item.category}
            image={item.image}
            alt={item.name}
            className="h-12 w-12"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-[17px] leading-6 font-semibold tracking-[-0.01em] text-[#0F172A] group-hover:text-[#059669] transition-colors line-clamp-2">
                {item.name}
              </h3>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-medium text-[#64748B]">
              <span className="text-[#0F172A] font-semibold">{item.location}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {item.quantity} {item.unit}
              </span>
              <span aria-hidden="true">·</span>
              <span>Added {formatShortDate(item.addedAt)}</span>
            </div>

            {item.notes && (
              <p className="mt-1.5 text-xs text-[#64748B] line-clamp-1">
                {item.notes}
              </p>
            )}
          </div>
        </button>

        {/* Bottom bar: Urgency Badge + Quick-Action Resolution Tray */}
        <div className="pt-2.5 border-t border-[#F4F4F0] flex items-center justify-between gap-2 min-h-[44px]">
          <span
            className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border text-[11px] font-bold tracking-[0.02em] whitespace-nowrap shrink-0 ${badgeStyles}`}
          >
            <UrgencyIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>{urgencyLabel}</span>
          </span>

          {confirmingDiscard ? (
            <div
              className="flex items-center gap-1 flex-wrap justify-end"
              role="group"
              aria-label={`Select discard reason for ${item.name}`}
            >
              {DISCARD_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => {
                    onDiscard(item, reason);
                    setConfirmingDiscard(false);
                  }}
                  className="h-8 px-2.5 rounded-lg bg-[#FEF2F2] text-[#DC2626] hover:bg-[#DC2626] hover:text-white text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {reason}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setConfirmingDiscard(false)}
                aria-label="Cancel discard"
                className="w-8 h-8 rounded-lg bg-[#F4F4F0] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onConsume(item)}
                className="inline-flex items-center gap-1.5 min-h-[40px] sm:min-h-[36px] px-3 rounded-lg bg-[#ECFDF5] text-[#059669] hover:bg-[#059669] hover:text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
              >
                <Utensils className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Eaten</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmingDiscard(true)}
                aria-label={`Discard ${item.name}`}
                title="Discard item"
                className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] rounded-lg bg-[#F1F5F9] text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
