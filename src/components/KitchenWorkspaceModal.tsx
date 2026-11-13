import React, { useEffect, useState } from 'react';
import {
  X,
  Plus,
  LayoutGrid,
  Flame,
  ShoppingBasket,
  BarChart3,
  Clock,
} from 'lucide-react';
import {
  ActivityEntry,
  AppScreen,
  DiscardReason,
  InventoryItem,
  ShoppingItem,
  StorageLocation,
  UrgencyTier,
} from '../types';
import { getDaysRemaining, getUrgencyTier } from '../utils/dates';
import { MetricCounters } from './MetricCounters';
import { InventoryCard } from './InventoryCard';
import { UseSoonView } from './UseSoonView';
import { ShoppingListView } from './ShoppingListView';
import { ImpactLogView } from './ImpactLogView';

interface KitchenWorkspaceModalProps {
  isOpen: boolean;
  initialTab?: AppScreen;
  onClose: () => void;
  inventory: InventoryItem[];
  shoppingList: ShoppingItem[];
  activity: ActivityEntry[];
  onOpenAdd: () => void;
  onSelectItem: (item: InventoryItem) => void;
  onConsumeItem: (item: InventoryItem) => void;
  onDiscardItem: (item: InventoryItem, reason: DiscardReason) => void;
  onFreezeSave: (item: InventoryItem) => void;
  onBatchConsume: (items: InventoryItem[]) => void;
  onAddShoppingItem: (item: Omit<ShoppingItem, 'id'>) => void;
  onToggleShoppingItem: (id: string) => void;
  onRemoveShoppingItem: (id: string) => void;
  onStockChecked: () => void;
  onUndoEntry: (entry: ActivityEntry) => void;
}

export const KitchenWorkspaceModal: React.FC<KitchenWorkspaceModalProps> = ({
  isOpen,
  initialTab = 'inventory',
  onClose,
  inventory,
  shoppingList,
  activity,
  onOpenAdd,
  onSelectItem,
  onConsumeItem,
  onDiscardItem,
  onFreezeSave,
  onBatchConsume,
  onAddShoppingItem,
  onToggleShoppingItem,
  onRemoveShoppingItem,
  onStockChecked,
  onUndoEntry,
}) => {
  const [tab, setTab] = useState<AppScreen>(initialTab);
  const [locationFilter, setLocationFilter] = useState<StorageLocation | 'All'>('All');
  const [tierFilter, setTierFilter] = useState<UrgencyTier | 'all'>('all');

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const freshCount = inventory.filter(
    (i) => getUrgencyTier(i.expiresAt, i.hoursRemaining) === 'fresh'
  ).length;
  const soonCount = inventory.filter(
    (i) => getUrgencyTier(i.expiresAt, i.hoursRemaining) === 'soon'
  ).length;
  const criticalCount = inventory.filter(
    (i) => getUrgencyTier(i.expiresAt, i.hoursRemaining) === 'critical'
  ).length;

  const filteredItems = inventory
    .filter((i) => {
      if (locationFilter !== 'All' && i.location !== locationFilter) return false;
      if (
        tierFilter !== 'all' &&
        getUrgencyTier(i.expiresAt, i.hoursRemaining) !== tierFilter
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => getDaysRemaining(a.expiresAt) - getDaysRemaining(b.expiresAt));

  const existingNames = new Set(inventory.map((i) => i.name.toLowerCase()));

  const navTabs: {
    id: AppScreen;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'inventory', label: 'All Shelf', icon: LayoutGrid },
    { id: 'use-soon', label: 'Eat First', icon: Flame },
    { id: 'shopping', label: 'Shopping List', icon: ShoppingBasket },
    { id: 'impact', label: 'Savings Log', icon: BarChart3 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-[3px] flex items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="My Kitchen Workspace"
      onClick={onClose}
    >
      <div
        className="w-full h-full sm:h-[90vh] sm:max-w-6xl bg-[#FBFBF9] border-0 sm:border-2 sm:border-[#0F172A] flex flex-col overflow-hidden elevation-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Workspace Header */}
        <div className="bg-white border-b border-[#0F172A] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0B8A3E] border border-[#0F172A] flex items-center justify-center text-white shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display text-base font-bold uppercase tracking-tight text-[#0F172A]">
                EAT BEFORE · MY KITCHEN
              </div>
              <div className="text-[11px] font-semibold text-[#64748B]">
                {inventory.length} active items · {soonCount + criticalCount} need attention
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAdd}
              className="h-9 px-3.5 bg-[#0B8A3E] hover:bg-[#065F46] text-white border border-[#0F172A] text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close kitchen workspace"
              className="w-9 h-9 border border-[#0F172A] bg-white hover:bg-[#F4F4F0] text-[#0F172A] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace Tab Bar */}
        <div className="bg-white border-b border-[#E2E8F0] px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
          {navTabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`h-9 px-3.5 text-xs font-bold uppercase tracking-wide flex items-center gap-2 border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1] hover:border-[#0F172A]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Workspace Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {tab === 'inventory' && (
            <>
              <MetricCounters
                freshCount={freshCount}
                soonCount={soonCount}
                criticalCount={criticalCount}
                activeTier={tierFilter}
                onSelectTier={setTierFilter}
              />

              <div className="flex flex-wrap items-center gap-2">
                {(['All', 'Fridge', 'Freezer', 'Pantry'] as const).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocationFilter(loc)}
                    className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide border transition-colors cursor-pointer ${
                      locationFilter === loc
                        ? 'bg-[#0F172A] text-white border-[#0F172A]'
                        : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:border-[#0F172A]'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <InventoryCard
                    key={item.id}
                    item={item}
                    onConsume={onConsumeItem}
                    onDiscard={onDiscardItem}
                    onSelect={onSelectItem}
                  />
                ))}
              </div>
            </>
          )}

          {tab === 'use-soon' && (
            <UseSoonView
              items={inventory}
              onConsume={onConsumeItem}
              onDiscard={onDiscardItem}
              onFreezeSave={onFreezeSave}
              onSelect={onSelectItem}
              onBatchConsume={onBatchConsume}
            />
          )}

          {tab === 'shopping' && (
            <ShoppingListView
              shoppingList={shoppingList}
              recentActivity={activity}
              existingNames={existingNames}
              onAddShoppingItem={onAddShoppingItem}
              onToggleItem={onToggleShoppingItem}
              onRemoveItem={onRemoveShoppingItem}
              onStockChecked={onStockChecked}
            />
          )}

          {tab === 'impact' && (
            <ImpactLogView
              activity={activity}
              inventory={inventory}
              onUndoEntry={onUndoEntry}
            />
          )}
        </div>
      </div>
    </div>
  );
};
