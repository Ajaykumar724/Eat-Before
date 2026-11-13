import React, { useState } from 'react';
import {
  Plus,
  Check,
  Trash2,
  ArrowRight,
  RotateCcw,
  ShoppingBasket,
} from 'lucide-react';
import {
  ActivityEntry,
  FoodCategory,
  ShoppingItem,
  StorageLocation,
} from '../types';
import { CategoryIcon } from './CategoryIcon';

interface ShoppingListViewProps {
  shoppingList: ShoppingItem[];
  recentActivity: ActivityEntry[];
  existingNames: Set<string>;
  onAddShoppingItem: (item: Omit<ShoppingItem, 'id'>) => void;
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onStockChecked: () => void;
}

const LOCATIONS: StorageLocation[] = ['Fridge', 'Freezer', 'Pantry'];

const DEFAULT_SHELF_LIFE: Record<StorageLocation, number> = {
  Fridge: 7,
  Freezer: 90,
  Pantry: 60,
};

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  shoppingList,
  recentActivity,
  existingNames,
  onAddShoppingItem,
  onToggleItem,
  onRemoveItem,
  onStockChecked,
}) => {
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState<StorageLocation>('Fridge');
  const [newQuantity, setNewQuantity] = useState('1');

  const checkedCount = shoppingList.filter((s) => s.checked).length;

  // Suggest items recently consumed/discarded that are not currently in inventory or shopping list
  const shoppingNames = new Set(shoppingList.map((s) => s.name.toLowerCase()));
  const suggestions = recentActivity
    .filter(
      (entry, index, self) =>
        !existingNames.has(entry.itemName.toLowerCase()) &&
        !shoppingNames.has(entry.itemName.toLowerCase()) &&
        self.findIndex((e) => e.itemName === entry.itemName) === index
    )
    .slice(0, 4);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const category: FoodCategory =
      newLocation === 'Freezer'
        ? 'Frozen'
        : newLocation === 'Pantry'
          ? 'Dry Goods'
          : 'Produce';
    onAddShoppingItem({
      name: newName.trim(),
      category,
      preferredLocation: newLocation,
      quantity: newQuantity.trim() || '1 item',
      checked: false,
      defaultShelfLifeDays: DEFAULT_SHELF_LIFE[newLocation],
      estimatedValue: 4.5,
    });
    setNewName('');
    setNewQuantity('1');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-[28px] font-bold tracking-[-0.02em] text-[#0F172A]">
            Shopping & Restock
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Check off groceries at the store, then move them straight into your kitchen inventory.
          </p>
        </div>

        {checkedCount > 0 && (
          <button
            type="button"
            onClick={onStockChecked}
            className="h-11 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-2 elevation-fab transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <span>Stock {checkedCount} Checked into Kitchen</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </header>

      {/* Quick Add Form */}
      <form
        onSubmit={handleAdd}
        className="bg-white border border-[#E2E8F0] rounded-2xl p-4 elevation-card flex flex-col sm:flex-row gap-2.5"
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add grocery item (e.g., Cherry Tomatoes, Oat Milk)"
          className="flex-1 h-11 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#FBFBF9] text-sm font-medium text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]"
        />
        <input
          type="text"
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          placeholder="Qty"
          aria-label="Quantity"
          className="w-full sm:w-28 h-11 px-3 rounded-xl border border-[#E2E8F0] bg-[#FBFBF9] text-sm font-medium text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]"
        />
        <select
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value as StorageLocation)}
          aria-label="Destination storage zone"
          className="h-11 px-3 rounded-xl border border-[#E2E8F0] bg-[#FBFBF9] text-sm font-semibold text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]"
        >
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              To {loc}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-11 px-5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </form>

      {/* Restock Suggestions from Recent Activity */}
      {suggestions.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.04em] text-[#64748B]">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Quick Restock from Recently Finished</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() =>
                  onAddShoppingItem({
                    name: entry.itemName,
                    category: entry.category,
                    preferredLocation: entry.location,
                    quantity: '1',
                    checked: false,
                    defaultShelfLifeDays: DEFAULT_SHELF_LIFE[entry.location],
                    estimatedValue: entry.estimatedValue,
                  })
                }
                className="h-9 px-3.5 rounded-full bg-[#F4F4F0] hover:bg-[#0F172A] hover:text-white text-[#0F172A] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{entry.itemName}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Shopping Items */}
      {shoppingList.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center elevation-card">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F4F4F0] text-[#64748B] flex items-center justify-center">
            <ShoppingBasket className="w-6 h-6" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-[#0F172A]">
            Your Shopping List Is Clear
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Add groceries above or queue restocks directly from any kitchen item.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl divide-y divide-[#F4F4F0] elevation-card overflow-hidden">
          {shoppingList.map((item) => (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between gap-3 hover:bg-[#FBFBF9] transition-colors"
            >
              <button
                type="button"
                onClick={() => onToggleItem(item.id)}
                className="flex items-center gap-3.5 min-w-0 flex-1 text-left cursor-pointer"
              >
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                    item.checked
                      ? 'bg-[#059669] border-[#059669] text-white'
                      : 'border-[#CBD5E1] bg-white'
                  }`}
                >
                  {item.checked && <Check className="w-3.5 h-3.5" />}
                </div>
                <CategoryIcon category={item.category} className="w-9 h-9" />
                <div className="min-w-0">
                  <div
                    className={`font-display text-base font-bold truncate ${
                      item.checked ? 'line-through text-[#64748B]' : 'text-[#0F172A]'
                    }`}
                  >
                    {item.name}
                  </div>
                  <div className="text-xs text-[#64748B] font-medium">
                    {item.quantity} · Store in {item.preferredLocation}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                aria-label={`Remove ${item.name} from shopping list`}
                className="w-10 h-10 rounded-lg text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#DC2626] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
