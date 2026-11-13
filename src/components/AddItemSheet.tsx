import React, { useState } from 'react';
import { X, ScanBarcode, Sparkles, Plus, Check } from 'lucide-react';
import { FoodCategory, InventoryItem, QuickPreset, StorageLocation } from '../types';
import { QUICK_PRESETS } from '../data/initialData';
import { addDaysToToday } from '../utils/dates';
import { CategoryIcon } from './CategoryIcon';

interface AddItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<InventoryItem, 'id'>) => void;
  defaultLocation?: StorageLocation;
}

const CATEGORIES: FoodCategory[] = [
  'Produce',
  'Dairy',
  'Meat & Fish',
  'Bakery',
  'Dry Goods',
  'Beverages',
  'Leftovers',
  'Frozen',
];

const LOCATIONS: StorageLocation[] = ['Fridge', 'Freezer', 'Pantry'];

const SHELF_LIFE_PRESETS = [
  { label: '+3 days', days: 3 },
  { label: '+1 week', days: 7 },
  { label: '+2 weeks', days: 14 },
  { label: '+1 month', days: 30 },
  { label: '+3 months', days: 90 },
];

export const AddItemSheet: React.FC<AddItemSheetProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultLocation = 'Fridge',
}) => {
  const [tab, setTab] = useState<'quick' | 'manual' | 'scan'>('quick');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Produce');
  const [location, setLocation] = useState<StorageLocation>(defaultLocation);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('item');
  const [expiresAt, setExpiresAt] = useState(addDaysToToday(7));
  const [estimatedValue, setEstimatedValue] = useState('95');
  const [notes, setNotes] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [justAddedName, setJustAddedName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickAdd = (preset: QuickPreset) => {
    onAdd({
      name: preset.name,
      category: preset.category,
      location: preset.location,
      quantity: preset.quantity,
      unit: preset.unit,
      addedAt: addDaysToToday(0),
      expiresAt: addDaysToToday(preset.shelfLifeDays),
      estimatedValue: preset.estimatedValue,
    });
    setJustAddedName(preset.name);
    setTimeout(() => setJustAddedName(null), 1600);
  };

  const handleLoadBarcode = (preset: QuickPreset) => {
    setName(preset.name);
    setCategory(preset.category);
    setLocation(preset.location);
    setQuantity(preset.quantity);
    setUnit(preset.unit);
    setExpiresAt(addDaysToToday(preset.shelfLifeDays));
    setEstimatedValue(preset.estimatedValue.toFixed(2));
    setBarcodeInput(preset.barcode || '');
    setTab('manual');
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      category,
      location,
      quantity: Math.max(1, quantity),
      unit: unit.trim() || 'item',
      addedAt: addDaysToToday(0),
      expiresAt,
      estimatedValue: parseFloat(estimatedValue) || 0,
      notes: notes.trim() || undefined,
    });
    setName('');
    setNotes('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0F172A]/40 backdrop-blur-[4px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-item-sheet-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-2xl elevation-sheet border border-[#E2E8F0] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-[#E2E8F0]" aria-hidden="true" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-4 border-b border-[#F4F4F0] flex items-center justify-between gap-4">
          <div>
            <h2
              id="add-item-sheet-title"
              className="font-display text-xl font-bold text-[#0F172A] tracking-[-0.015em]"
            >
              Log Kitchen Item
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Tap a staple for instant logging or enter custom expiry details.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add item sheet"
            className="w-10 h-10 rounded-full bg-[#F4F4F0] hover:bg-[#E2E8F0] text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="px-5 pt-3">
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#F4F4F0] rounded-xl">
            <button
              type="button"
              onClick={() => setTab('quick')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                tab === 'quick'
                  ? 'bg-white text-[#0F172A] elevation-card'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Staples</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('manual')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                tab === 'manual'
                  ? 'bg-white text-[#0F172A] elevation-card'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Custom Entry</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('scan')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                tab === 'scan'
                  ? 'bg-white text-[#0F172A] elevation-card'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <ScanBarcode className="w-3.5 h-3.5" />
              <span>Barcode</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {tab === 'quick' && (
            <div className="space-y-4">
              {justAddedName && (
                <div className="px-3.5 py-2.5 rounded-xl bg-[#ECFDF5] border border-[#059669]/25 text-[#059669] text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Added {justAddedName} to your kitchen!</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleQuickAdd(preset)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#E2E8F0] hover:border-[#059669] hover:bg-[#ECFDF5]/35 text-left transition-colors cursor-pointer group"
                  >
                    <CategoryIcon category={preset.category} className="w-10 h-10" />
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-sm font-bold text-[#0F172A] truncate">
                        {preset.name}
                      </div>
                      <div className="text-[11px] text-[#64748B] font-medium">
                        {preset.location} · +{preset.shelfLifeDays}d shelf life
                      </div>
                    </div>
                    <span className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] group-hover:bg-[#059669] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                      <Plus className="w-4 h-4" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'scan' && (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#FBFBF9] p-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                  <ScanBarcode className="w-7 h-7" />
                </div>
                <h3 className="mt-3 font-display text-base font-bold text-[#0F172A]">
                  Barcode & SKU Lookup
                </h3>
                <p className="mt-1 text-xs text-[#64748B] max-w-sm mx-auto">
                  Enter a product UPC or tap a sample grocery scan below to pre-fill item details and shelf life.
                </p>

                <div className="mt-4 flex gap-2 max-w-sm mx-auto">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="e.g. 041220194812"
                    className="flex-1 h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#059669] tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const match = QUICK_PRESETS.find((p) => p.barcode === barcodeInput.trim());
                      if (match) {
                        handleLoadBarcode(match);
                      } else {
                        setName(barcodeInput.trim() ? `Scanned Item #${barcodeInput.trim().slice(-4)}` : 'Scanned Pantry Item');
                        setTab('manual');
                      }
                    }}
                    className="h-10 px-4 rounded-lg bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] cursor-pointer whitespace-nowrap"
                  >
                    Lookup
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-[#64748B] uppercase tracking-[0.04em] mb-2">
                  Recent Household Barcodes
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_PRESETS.slice(0, 4).map((preset) => (
                    <button
                      key={preset.barcode}
                      type="button"
                      onClick={() => handleLoadBarcode(preset)}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#F4F4F0] hover:bg-[#E2E8F0]/70 text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#0F172A]">{preset.name}</div>
                        <div className="text-[11px] font-mono text-[#64748B] tabular-nums">
                          UPC {preset.barcode}
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#059669]">Load</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'manual' && (
            <form onSubmit={handleSubmitManual} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Fresh Mozzarella, Baby Carrots"
                  className="w-full h-11 px-3.5 rounded-lg border border-[#E2E8F0] bg-[#FBFBF9] text-sm font-medium text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  Storage Location
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className={`h-10 rounded-full text-xs font-bold transition-colors cursor-pointer ${
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FoodCategory)}
                    className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] bg-[#FBFBF9] text-sm font-medium text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                    Est. Value (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] bg-[#FBFBF9] text-sm font-medium text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669] tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                    Quantity
                  </label>
                  <div className="flex items-center h-11 rounded-lg border border-[#E2E8F0] bg-[#FBFBF9] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-11 h-full flex items-center justify-center text-base font-bold text-[#0F172A] hover:bg-[#F4F4F0] cursor-pointer"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center font-display font-bold text-sm tabular-nums">
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
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g., bag, carton, kg"
                    className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] bg-[#FBFBF9] text-sm font-medium text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#0F172A]">
                    Expires On
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {SHELF_LIFE_PRESETS.map((preset) => (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => setExpiresAt(addDaysToToday(preset.days))}
                        className="px-2 py-0.5 rounded-full bg-[#F4F4F0] hover:bg-[#0F172A] hover:text-white text-[11px] font-bold text-[#0F172A] transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="date"
                  required
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-[#E2E8F0] bg-[#FBFBF9] text-sm font-medium text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  Shelf Note (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Opened, bottom crisper"
                  className="w-full h-11 px-3.5 rounded-lg border border-[#E2E8F0] bg-[#FBFBF9] text-sm font-medium text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm transition-colors cursor-pointer elevation-fab"
              >
                Save to {location}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
