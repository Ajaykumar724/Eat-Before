import React, { useState } from 'react';
import { Utensils, Trash2, Snowflake, RotateCcw } from 'lucide-react';
import { ActivityEntry, InventoryItem } from '../types';
import { formatRelativeTime } from '../utils/dates';
import { FoodItemVisual } from './FoodItemVisual';

interface ImpactLogViewProps {
  activity: ActivityEntry[];
  inventory: InventoryItem[];
  onUndoEntry: (entry: ActivityEntry) => void;
}

export const ImpactLogView: React.FC<ImpactLogViewProps> = ({
  activity,
  inventory,
  onUndoEntry,
}) => {
  const [filter, setFilter] = useState<'all' | 'consumed' | 'discarded' | 'frozen'>('all');

  const consumedEntries = activity.filter((a) => a.action === 'consumed');
  const discardedEntries = activity.filter((a) => a.action === 'discarded');
  const frozenEntries = activity.filter((a) => a.action === 'frozen');

  const totalSavedValue = consumedEntries.reduce((sum, a) => sum + a.estimatedValue, 0);
  const totalResolutions = consumedEntries.length + discardedEntries.length;
  const rescueRate =
    totalResolutions > 0
      ? Math.round((consumedEntries.length / totalResolutions) * 100)
      : 100;

  const filteredActivity =
    filter === 'all' ? activity : activity.filter((a) => a.action === filter);

  const zoneCounts = {
    Fridge: inventory.filter((i) => i.location === 'Fridge').length,
    Freezer: inventory.filter((i) => i.location === 'Freezer').length,
    Pantry: inventory.filter((i) => i.location === 'Pantry').length,
  };

  const totalStock = Math.max(1, inventory.length);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-[28px] font-bold tracking-[-0.02em] text-[#0F172A]">
          Kitchen Savings & Activity
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Real-time log of ingredients eaten, frozen for later, or discarded.
        </p>
      </header>

      {/* High-Contrast Summary Counters */}
      <section className="bg-white border border-[#E2E8F0] rounded-2xl elevation-card overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0]">
          <div className="p-5">
            <div className="font-display text-[32px] leading-9 font-bold text-[#059669] tabular-nums">
              {consumedEntries.length}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-[0.04em] text-[#0F172A]">
              Items Eaten
            </div>
            <div className="mt-0.5 text-xs text-[#64748B]">
              Logged before spoilage
            </div>
          </div>

          <div className="p-5">
            <div className="font-display text-[32px] leading-9 font-bold text-[#0F172A] tabular-nums">
              ₹{Math.round(totalSavedValue).toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-[0.04em] text-[#0F172A]">
              Groceries Saved
            </div>
            <div className="mt-0.5 text-xs text-[#64748B]">
              Value of consumed stock
            </div>
          </div>

          <div className="p-5">
            <div className="font-display text-[32px] leading-9 font-bold text-[#059669] tabular-nums">
              {rescueRate}%
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-[0.04em] text-[#0F172A]">
              Use-Up Rate
            </div>
            <div className="mt-0.5 text-xs text-[#64748B]">
              {discardedEntries.length} discarded · {frozenEntries.length} frozen
            </div>
          </div>
        </div>
      </section>

      {/* Zone Distribution Bar */}
      <section className="bg-white border border-[#E2E8F0] rounded-2xl p-5 elevation-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-bold text-[#0F172A]">
            Active Stock by Storage Zone
          </h2>
          <span className="text-xs font-bold text-[#64748B] tabular-nums">
            {inventory.length} items total
          </span>
        </div>

        <div className="h-3 rounded-full bg-[#F4F4F0] overflow-hidden flex">
          <div
            style={{ width: `${(zoneCounts.Fridge / totalStock) * 100}%` }}
            className="bg-[#059669] transition-all duration-300"
            title={`Fridge: ${zoneCounts.Fridge}`}
          />
          <div
            style={{ width: `${(zoneCounts.Freezer / totalStock) * 100}%` }}
            className="bg-[#0891B2] transition-all duration-300"
            title={`Freezer: ${zoneCounts.Freezer}`}
          />
          <div
            style={{ width: `${(zoneCounts.Pantry / totalStock) * 100}%` }}
            className="bg-[#D97706] transition-all duration-300"
            title={`Pantry: ${zoneCounts.Pantry}`}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-5 text-xs font-semibold text-[#0F172A]">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#059669]" />
            <span>Fridge</span>
            <span className="text-[#64748B] tabular-nums">{zoneCounts.Fridge}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#0891B2]" />
            <span>Freezer</span>
            <span className="text-[#64748B] tabular-nums">{zoneCounts.Freezer}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706]" />
            <span>Pantry</span>
            <span className="text-[#64748B] tabular-nums">{zoneCounts.Pantry}</span>
          </span>
        </div>
      </section>

      {/* Activity Ledger */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-[#0F172A]">
            Recent Kitchen Activity
          </h2>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'consumed', label: 'Eaten' },
                { id: 'frozen', label: 'Frozen' },
                { id: 'discarded', label: 'Discarded' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  filter === tab.id
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-[#F4F4F0] text-[#1E293B] hover:bg-[#E2E8F0]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl divide-y divide-[#F4F4F0] elevation-card overflow-hidden">
          {filteredActivity.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#64748B]">
              No activity entries in this filter yet.
            </div>
          ) : (
            filteredActivity.map((entry) => {
              const isConsumed = entry.action === 'consumed';
              const isFrozen = entry.action === 'frozen';

              return (
                <div
                  key={entry.id}
                  className="p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <FoodItemVisual
                      category={entry.category}
                      image={entry.originalItem?.image}
                      alt={entry.itemName}
                      className="h-10 w-10"
                    />
                    <div className="min-w-0">
                      <div className="font-display text-sm sm:text-base font-bold text-[#0F172A] truncate">
                        {entry.itemName}
                      </div>
                      <div className="text-xs text-[#64748B] font-medium flex flex-wrap items-center gap-x-1.5">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            isConsumed
                              ? 'text-[#059669]'
                              : isFrozen
                                ? 'text-[#0891B2]'
                                : 'text-[#DC2626]'
                          }`}
                        >
                          {isConsumed ? (
                            <Utensils className="w-3 h-3" />
                          ) : isFrozen ? (
                            <Snowflake className="w-3 h-3" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          <span>
                            {isConsumed
                              ? 'Eaten'
                              : isFrozen
                                ? 'Moved to Freezer'
                                : `Discarded (${entry.reason || 'Expired'})`}
                          </span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{entry.location}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatRelativeTime(entry.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-[#0F172A] tabular-nums">
                      ₹{Math.round(entry.estimatedValue)}
                    </span>
                    {entry.originalItem && (
                      <button
                        type="button"
                        onClick={() => onUndoEntry(entry)}
                        title="Restore item back to kitchen"
                        className="h-8 px-2.5 rounded-lg bg-[#F4F4F0] hover:bg-[#0F172A] hover:text-white text-[#0F172A] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
