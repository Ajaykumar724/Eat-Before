import React, { useState, useEffect } from 'react';
import { X, Snowflake, Utensils, ShoppingBasket, Trash2 } from 'lucide-react';
import { DiscardReason, InventoryItem, StorageLocation } from '../types';
import {
  addDaysToDateString,
  formatShortDate,
  formatUrgencyLabel,
  getUrgencyTier,
} from '../utils/dates';
import { FoodItemVisual } from './FoodItemVisual';

interface ItemDetailModalProps {
  item: InventoryItem | null;
  onClose: () => void;
  onUpdate: (updated: InventoryItem) => void;
  onFreezeSave: (item: InventoryItem) => void;
  onConsume: (item: InventoryItem) => void;
  onDiscard: (item: InventoryItem, reason: DiscardReason) => void;
  onAddToShopping: (item: InventoryItem) => void;
}

const LOCATIONS: StorageLocation[] = ['Fridge', 'Freezer', 'Pantry'];

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onUpdate,
  onFreezeSave,
  onConsume,
  onDiscard,
  onAddToShopping,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState<StorageLocation>('Fridge');
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');
  const [showDiscardOptions, setShowDiscardOptions] = useState(false);

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity);
      setLocation(item.location);
      setExpiresAt(item.expiresAt);
      setNotes(item.notes || '');
      setShowDiscardOptions(false);
    }
  }, [item]);

  if (!item) return null;

  const tier = getUrgencyTier(expiresAt || item.expiresAt);
  const urgencyLabel = formatUrgencyLabel(expiresAt || item.expiresAt);

  const badgeTone =
    tier === 'critical'
      ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/25'
      : tier === 'soon'
        ? 'bg-[#FFFBEB] text-[#D97706] border-[#D97706]/25'
        : 'bg-[#ECFDF5] text-[#059669] border-[#059669]/25';

  const handleSaveChanges = () => {
    onUpdate({
      ...item,
      quantity: Math.max(1, quantity),
      location,
      expiresAt,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0F172A]/40 backdrop-blur-[4px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-detail-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl elevation-sheet border border-[#E2E8F0] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-[#E2E8F0]" aria-hidden="true" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b border-[#F4F4F0] flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0">
            <FoodItemVisual
              category={item.category}
              image={item.image}
              alt={item.name}
              className="h-12 w-12"
            />
            <div className="min-w-0">
              <h2
                id="item-detail-title"
                className="font-display text-xl font-bold text-[#0F172A] leading-tight"
              >
                {item.name}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs text-[#64748B] font-medium">
                <span>{item.category}</span>
                <span aria-hidden="true">·</span>
                <span>Added {formatShortDate(item.addedAt)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close item details"
            className="w-10 h-10 rounded-full bg-[#F4F4F0] hover:bg-[#E2E8F0] text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {item.image && (
            <div className="flex h-40 items-center justify-center border border-[#E2E8F0] bg-[#F8FAFC]">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-contain p-3"
              />
            </div>
          )}

          {/* Urgency Status & Quick Freeze Rescue */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FBFBF9] border border-[#E2E8F0]">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#64748B]">
                Freshness Status
              </div>
              <span
                className={`mt-1 inline-flex items-center h-6 px-2.5 rounded-full border text-[11px] font-bold ${badgeTone}`}
              >
                {urgencyLabel}
              </span>
            </div>

            {item.location !== 'Freezer' && (
              <button
                type="button"
                onClick={() => {
                  onFreezeSave(item);
                  onClose();
                }}
                className="h-10 px-3.5 rounded-xl bg-[#ECFEFF] text-[#0891B2] hover:bg-[#0891B2] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Snowflake className="w-4 h-4 shrink-0" />
                <span>Move to Freezer (+30d)</span>
              </button>
            )}
          </div>

          {/* Quantity & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                Quantity ({item.unit})
              </label>
              <div className="flex items-center h-11 rounded-lg border border-[#E2E8F0] bg-[#FBFBF9] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-full flex items-center justify-center text-base font-bold text-[#0F172A] hover:bg-[#F4F4F0] cursor-pointer"
                >
                  −
                </button>
                <span className="flex-1 text-center font-display font-bold text-base tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-11 h-full flex items-center justify-center text-base font-bold text-[#0F172A] hover:bg-[#F4F4F0] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                Storage Zone
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className={`h-11 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      location === loc
                        ? 'bg-[#0F172A] text-white'
                        : 'bg-[#F4F4F0] text-[#0F172A] hover:bg-[#E2E8F0]'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Expiry Date + Quick Extend */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#0F172A]">Expiry Date</label>
              <button
                type="button"
                onClick={() => setExpiresAt(addDaysToDateString(expiresAt, 3))}
                className="text-xs font-bold text-[#059669] hover:underline cursor-pointer"
              >
                +3 Days Still Fresh
              </button>
            </div>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full h-11 px-3.5 rounded-lg border border-[#E2E8F0] bg-[#FBFBF9] text-sm font-medium text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
              Kitchen Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Shelf location, recipe plan, opened date..."
              className="w-full h-11 px-3.5 rounded-lg border border-[#E2E8F0] bg-[#FBFBF9] text-sm font-medium text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]"
            />
          </div>

          {/* Secondary Utility Actions */}
          <div className="pt-2 border-t border-[#F4F4F0] flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                onAddToShopping(item);
                onClose();
              }}
              className="h-10 px-3 rounded-lg bg-[#F4F4F0] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingBasket className="w-4 h-4" />
              <span>Add to Shopping List</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onConsume(item);
                  onClose();
                }}
                className="h-10 px-3.5 rounded-lg bg-[#ECFDF5] hover:bg-[#059669] text-[#059669] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Utensils className="w-4 h-4" />
                <span>Mark Eaten</span>
              </button>

              {!showDiscardOptions ? (
                <button
                  type="button"
                  onClick={() => setShowDiscardOptions(true)}
                  className="h-10 px-3 rounded-lg bg-[#F1F5F9] hover:bg-[#FEF2F2] text-[#64748B] hover:text-[#DC2626] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Discard</span>
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  {(['Expired', 'Spoiled', 'Other'] as DiscardReason[]).map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => {
                        onDiscard(item, reason);
                        onClose();
                      }}
                      className="h-10 px-2.5 rounded-lg bg-[#FEF2F2] text-[#DC2626] hover:bg-[#DC2626] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Footer Save */}
        <div className="p-4 border-t border-[#F4F4F0] bg-[#FBFBF9] flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-[#E2E8F0] bg-white text-sm font-bold text-[#0F172A] hover:bg-[#F4F4F0] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            className="flex-1 h-11 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-bold transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
