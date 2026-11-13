import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  Snowflake,
  Utensils,
  ChefHat,
  CheckCircle2,
} from 'lucide-react';
import { DiscardReason, InventoryItem } from '../types';
import { formatUrgencyLabel, getDaysRemaining, getUrgencyTier } from '../utils/dates';
import { FoodItemVisual } from './FoodItemVisual';

interface UseSoonViewProps {
  items: InventoryItem[];
  onConsume: (item: InventoryItem) => void;
  onDiscard: (item: InventoryItem, reason: DiscardReason) => void;
  onFreezeSave: (item: InventoryItem) => void;
  onSelect: (item: InventoryItem) => void;
  onBatchConsume: (items: InventoryItem[]) => void;
}

interface MealIdea {
  id: string;
  title: string;
  prepMinutes: number;
  description: string;
  matchedItems: InventoryItem[];
}

export const UseSoonView: React.FC<UseSoonViewProps> = ({
  items,
  onConsume,
  onDiscard,
  onFreezeSave,
  onSelect,
  onBatchConsume,
}) => {
  const urgentItems = useMemo(() => {
    return items
      .filter((item) => getUrgencyTier(item.expiresAt) !== 'fresh')
      .sort((a, b) => getDaysRemaining(a.expiresAt) - getDaysRemaining(b.expiresAt));
  }, [items]);

  const criticalItems = urgentItems.filter((i) => getUrgencyTier(i.expiresAt) === 'critical');
  const soonItems = urgentItems.filter((i) => getUrgencyTier(i.expiresAt) === 'soon');

  const mealIdeas = useMemo<MealIdea[]>(() => {
    const ideas: MealIdea[] = [];
    const byKeyword = (kw: string[]) =>
      urgentItems.filter((item) =>
        kw.some((k) => item.name.toLowerCase().includes(k))
      );

    const greensAndProtein = byKeyword(['spinach', 'salmon', 'chicken', 'tofu', 'eggs']);
    if (greensAndProtein.length >= 2) {
      ideas.push({
        id: 'meal-skillet',
        title: '15-Minute Warm Skillet Bowl',
        prepMinutes: 15,
        description:
          'Sauté greens with garlic, sear protein in olive oil, and finish with lemon or yogurt drizzle.',
        matchedItems: greensAndProtein.slice(0, 3),
      });
    }

    const toastItems = byKeyword(['sourdough', 'bread', 'avocado', 'eggs', 'cheddar']);
    if (toastItems.length >= 2) {
      ideas.push({
        id: 'meal-toast',
        title: 'Loaded Kitchen Toast',
        prepMinutes: 8,
        description:
          'Crisp toasted slices topped with mashed avocado, soft-scrambled eggs, or melted cheddar.',
        matchedItems: toastItems.slice(0, 3),
      });
    }

    const yogurtFruit = byKeyword(['yogurt', 'blueberr', 'strawberr', 'oats', 'mango']);
    if (yogurtFruit.length >= 1) {
      const bonus = items.filter((i) =>
        ['oats', 'blueberr', 'yogurt', 'mango'].some((k) =>
          i.name.toLowerCase().includes(k)
        )
      );
      const unique = Array.from(new Set([...yogurtFruit, ...bonus])).slice(0, 3);
      if (unique.length >= 2) {
        ideas.push({
          id: 'meal-parfait',
          title: 'Quick Breakfast Parfait',
          prepMinutes: 5,
          description:
            'Layer creamy yogurt with berries or oats for an instant zero-cook breakfast or snack.',
          matchedItems: unique,
        });
      }
    }

    if (ideas.length === 0 && soonItems.length >= 2) {
      ideas.push({
        id: 'meal-rescue',
        title: 'Clean-Out-the-Fridge Stir Fry',
        prepMinutes: 15,
        description:
          'Combine your most urgent produce and proteins in a hot pan with soy sauce or olive oil.',
        matchedItems: soonItems.slice(0, 3),
      });
    }

    return ideas;
  }, [urgentItems, soonItems, items]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-[28px] font-bold tracking-[-0.02em] text-[#0F172A]">
            Use It Up Queue
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Prioritized ingredients expiring within 3 days or needing an immediate freshness check.
          </p>
        </div>
        <div className="text-xs font-bold text-[#0F172A] tabular-nums bg-[#F4F4F0] px-3.5 py-2 rounded-full self-start sm:self-auto">
          {urgentItems.length} {urgentItems.length === 1 ? 'item' : 'items'} needing attention
        </div>
      </header>

      {urgentItems.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center elevation-card">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-[#0F172A]">
            Zero Urgent Items
          </h2>
          <p className="mt-1 text-sm text-[#64748B] max-w-md mx-auto">
            Everything in your fridge, freezer, and pantry has 4+ days of shelf life left.
          </p>
        </div>
      ) : (
        <>
          {/* Dynamic Meal Rescue Combos */}
          {mealIdeas.length > 0 && (
            <section aria-label="Quick rescue meal ideas" className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.04em] text-[#64748B]">
                <ChefHat className="w-4 h-4 text-[#059669]" />
                <span>Cook Tonight with Expiring Items</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mealIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="bg-white border border-[#E2E8F0] rounded-2xl p-5 elevation-card flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="font-display text-lg font-bold text-[#0F172A]">
                          {idea.title}
                        </h2>
                        <span className="text-xs font-bold text-[#64748B] tabular-nums whitespace-nowrap">
                          {idea.prepMinutes} min
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-[#64748B] leading-relaxed">
                        {idea.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-[#0F172A]">
                        <span className="text-[#64748B]">Uses:</span>
                        {idea.matchedItems.map((m, idx) => (
                          <React.Fragment key={m.id}>
                            <span>{m.name}</span>
                            {idx < idea.matchedItems.length - 1 && (
                              <span className="text-[#64748B]" aria-hidden="true">
                                ·
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onBatchConsume(idea.matchedItems)}
                      className="h-10 px-4 rounded-xl bg-[#ECFDF5] hover:bg-[#059669] text-[#059669] hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer self-start"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>Cooked This — Mark {idea.matchedItems.length} Used</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Critical Section */}
          {criticalItems.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.04em] text-[#DC2626]">
                <AlertTriangle className="w-4 h-4" />
                <span>Critical Check ({criticalItems.length})</span>
              </div>
              <div className="space-y-2.5">
                {criticalItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative bg-white border border-[#E2E8F0] rounded-2xl p-4 pl-5 elevation-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#DC2626]" />
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className="flex items-center gap-3.5 text-left min-w-0 flex-1 cursor-pointer"
                    >
                      <FoodItemVisual
                        category={item.category}
                        image={item.image}
                        alt={item.name}
                        className="h-12 w-12"
                      />
                      <div className="min-w-0">
                        <div className="font-display text-base font-bold text-[#0F172A] truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-[#64748B] font-medium mt-0.5">
                          {item.location} · {item.quantity} {item.unit} ·{' '}
                          <span className="text-[#DC2626] font-bold">
                            {formatUrgencyLabel(item.expiresAt)}
                          </span>
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onConsume(item)}
                        className="h-9 px-3 rounded-lg bg-[#ECFDF5] text-[#059669] hover:bg-[#059669] hover:text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Still Good, Eaten
                      </button>
                      <button
                        type="button"
                        onClick={() => onDiscard(item, 'Expired')}
                        className="h-9 px-3 rounded-lg bg-[#FEF2F2] text-[#DC2626] hover:bg-[#DC2626] hover:text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Discard Expired
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Expiring Soon Section */}
          {soonItems.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.04em] text-[#D97706]">
                <Clock className="w-4 h-4" />
                <span>Use Within 3 Days ({soonItems.length})</span>
              </div>
              <div className="space-y-2.5">
                {soonItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative bg-white border border-[#E2E8F0] rounded-2xl p-4 pl-5 elevation-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D97706]" />
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className="flex items-center gap-3.5 text-left min-w-0 flex-1 cursor-pointer"
                    >
                      <FoodItemVisual
                        category={item.category}
                        image={item.image}
                        alt={item.name}
                        className="h-12 w-12"
                      />
                      <div className="min-w-0">
                        <div className="font-display text-base font-bold text-[#0F172A] truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-[#64748B] font-medium mt-0.5">
                          {item.location} · {item.quantity} {item.unit} ·{' '}
                          <span className="text-[#D97706] font-bold">
                            {formatUrgencyLabel(item.expiresAt)}
                          </span>
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.location !== 'Freezer' && (
                        <button
                          type="button"
                          onClick={() => onFreezeSave(item)}
                          className="h-9 px-3 rounded-lg bg-[#ECFEFF] text-[#0891B2] hover:bg-[#0891B2] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Snowflake className="w-3.5 h-3.5" />
                          <span>Freeze (+30d)</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onConsume(item)}
                        className="h-9 px-3 rounded-lg bg-[#ECFDF5] text-[#059669] hover:bg-[#059669] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Utensils className="w-3.5 h-3.5" />
                        <span>Eaten</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
