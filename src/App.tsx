import { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  Utensils,
  User,
  ShieldCheck,
  Zap,
  PlayCircle,
  List,
  Leaf,
  Rocket,
  CheckSquare,
  Smartphone,
  Plus,
  CheckCircle2,
  RotateCcw,
  ScanLine,
  Bell,
  Wallet,
} from 'lucide-react';
import {
  ActivityEntry,
  AppScreen,
  DiscardReason,
  InventoryItem,
  ShoppingItem,
} from './types';
import {
  INITIAL_ACTIVITY_LOG,
  INITIAL_INVENTORY,
  INITIAL_SHOPPING_LIST,
} from './data/initialData';
import { addDaysToToday, getDaysRemaining } from './utils/dates';
import { ShelfCard } from './components/ShelfCard';
import { AddItemSheet } from './components/AddItemSheet';
import { ItemDetailModal } from './components/ItemDetailModal';
import { KitchenWorkspaceModal } from './components/KitchenWorkspaceModal';

type ShelfFilter = 'all' | 'urgent' | 'fridge' | 'pantry';

interface ToastState {
  message: string;
  undoEntry?: ActivityEntry;
}

const STORAGE_KEYS = {
  inventory: 'eatbefore_inventory_v2',
  shopping: 'eatbefore_shopping_v2',
  activity: 'eatbefore_activity_v2',
  savedTotal: 'eatbefore_saved_v2',
};

function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    loadState(STORAGE_KEYS.inventory, INITIAL_INVENTORY)
  );
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() =>
    loadState(STORAGE_KEYS.shopping, INITIAL_SHOPPING_LIST)
  );
  const [activity, setActivity] = useState<ActivityEntry[]>(() =>
    loadState(STORAGE_KEYS.activity, INITIAL_ACTIVITY_LOG)
  );
  const [savedBaseline, setSavedBaseline] = useState<number>(() =>
    loadState(STORAGE_KEYS.savedTotal, 2480)
  );

  const [shelfFilter, setShelfFilter] = useState<ShelfFilter>('all');
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<AppScreen>('inventory');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(inventory));
    } catch {
      // ignore
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.shopping, JSON.stringify(shoppingList));
    } catch {
      // ignore
    }
  }, [shoppingList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.activity, JSON.stringify(activity));
    } catch {
      // ignore
    }
  }, [activity]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.savedTotal, JSON.stringify(savedBaseline));
    } catch {
      // ignore
    }
  }, [savedBaseline]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const isUrgentItem = (item: InventoryItem) =>
    item.hoursRemaining !== undefined || getDaysRemaining(item.expiresAt) <= 2;

  const counts = useMemo(() => {
    const all = inventory.length;
    const urgent = inventory.filter(isUrgentItem).length;
    const fridge = inventory.filter((i) => i.location === 'Fridge').length;
    const pantry = inventory.filter((i) => i.location === 'Pantry').length;
    return { all, urgent, fridge, pantry };
  }, [inventory]);

  const visibleShelfItems = useMemo(() => {
    const filtered = inventory.filter((item) => {
      if (shelfFilter === 'urgent') return isUrgentItem(item);
      if (shelfFilter === 'fridge') return item.location === 'Fridge';
      if (shelfFilter === 'pantry') return item.location === 'Pantry';
      return true;
    });

    // Keep the 5 flagship showcase items in exact order when viewing ALL, sorted by urgency
    const priorityOrder = ['inv-milk', 'inv-yogurt', 'inv-spinach', 'inv-sourdough', 'inv-oil'];
    return [...filtered].sort((a, b) => {
      if (shelfFilter === 'all') {
        const idxA = priorityOrder.indexOf(a.id);
        const idxB = priorityOrder.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
      }
      const hoursA = a.hoursRemaining ?? getDaysRemaining(a.expiresAt) * 24;
      const hoursB = b.hoursRemaining ?? getDaysRemaining(b.expiresAt) * 24;
      return hoursA - hoursB;
    });
  }, [inventory, shelfFilter]);

  const openWorkspace = (tab: AppScreen = 'inventory') => {
    setWorkspaceTab(tab);
    setWorkspaceOpen(true);
  };

  // Handlers
  const handleAddItem = (newItem: Omit<InventoryItem, 'id'>) => {
    const created: InventoryItem = {
      ...newItem,
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      zoneLabel: newItem.location.toUpperCase(),
      statusHint: 'JUST LOGGED',
    };
    setInventory((prev) => [created, ...prev]);
    setToast({ message: `Logged ${created.name} into ${created.location}` });
  };

  const handleUpdateItem = (updated: InventoryItem) => {
    setInventory((prev) =>
      prev.map((i) =>
        i.id === updated.id
          ? { ...updated, zoneLabel: updated.location.toUpperCase() }
          : i
      )
    );
    setToast({ message: `Updated ${updated.name}` });
  };

  const handleConsumeItem = (item: InventoryItem) => {
    const entry: ActivityEntry = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      location: item.location,
      action: 'consumed',
      estimatedValue: item.estimatedValue,
      timestamp: new Date().toISOString(),
      originalItem: item,
    };
    setInventory((prev) => prev.filter((i) => i.id !== item.id));
    setActivity((prev) => [entry, ...prev]);
    setSavedBaseline((prev) => prev + Math.round(item.estimatedValue));
    setToast({
      message: `Marked ${item.name} eaten · Saved ₹${Math.round(item.estimatedValue)}!`,
      undoEntry: entry,
    });
  };

  const handleBatchConsume = (itemsToConsume: InventoryItem[]) => {
    const ids = new Set(itemsToConsume.map((i) => i.id));
    const totalVal = itemsToConsume.reduce((s, i) => s + Math.round(i.estimatedValue), 0);
    const nowIso = new Date().toISOString();
    const newEntries: ActivityEntry[] = itemsToConsume.map((item, idx) => ({
      id: `act-${Date.now()}-${idx}`,
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      location: item.location,
      action: 'consumed',
      estimatedValue: item.estimatedValue,
      timestamp: nowIso,
      originalItem: item,
    }));
    setInventory((prev) => prev.filter((i) => !ids.has(i.id)));
    setActivity((prev) => [...newEntries, ...prev]);
    setSavedBaseline((prev) => prev + totalVal);
    setToast({
      message: `Cooked ${itemsToConsume.length} items · Saved ₹${totalVal}!`,
    });
  };

  const handleDiscardItem = (item: InventoryItem, reason: DiscardReason) => {
    const entry: ActivityEntry = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      location: item.location,
      action: 'discarded',
      reason,
      estimatedValue: item.estimatedValue,
      timestamp: new Date().toISOString(),
      originalItem: item,
    };
    setInventory((prev) => prev.filter((i) => i.id !== item.id));
    setActivity((prev) => [entry, ...prev]);
    setToast({
      message: `Logged ${item.name} as ${reason.toLowerCase()}`,
      undoEntry: entry,
    });
  };

  const handleFreezeSave = (item: InventoryItem) => {
    const extendedExpiry = addDaysToToday(
      Math.max(30, getDaysRemaining(item.expiresAt) + 30)
    );
    const updated: InventoryItem = {
      ...item,
      location: 'Freezer',
      zoneLabel: 'FREEZER',
      statusHint: 'FROZEN TO SAVE',
      hoursRemaining: undefined,
      expiresAt: extendedExpiry,
    };
    const entry: ActivityEntry = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      location: 'Freezer',
      action: 'frozen',
      estimatedValue: item.estimatedValue,
      timestamp: new Date().toISOString(),
    };
    setInventory((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    setActivity((prev) => [entry, ...prev]);
    setToast({ message: `Moved ${item.name} to Freezer (+30 days)` });
  };

  const handleUndoActivity = (entry: ActivityEntry) => {
    if (entry.originalItem) {
      setInventory((prev) => {
        if (prev.some((i) => i.id === entry.originalItem!.id)) return prev;
        return [entry.originalItem!, ...prev];
      });
    }
    if (entry.action === 'consumed') {
      setSavedBaseline((prev) => Math.max(0, prev - Math.round(entry.estimatedValue)));
    }
    setActivity((prev) => prev.filter((a) => a.id !== entry.id));
    setToast({ message: `Restored ${entry.itemName} back to shelf` });
  };

  const handleAddShoppingItem = (item: Omit<ShoppingItem, 'id'>) => {
    setShoppingList((prev) => [
      { ...item, id: `shop-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` },
      ...prev,
    ]);
  };

  const handleAddFromInventoryToShopping = (item: InventoryItem) => {
    if (shoppingList.some((s) => s.name.toLowerCase() === item.name.toLowerCase())) {
      setToast({ message: `${item.name} is already on your shopping list` });
      return;
    }
    handleAddShoppingItem({
      name: item.name,
      category: item.category,
      preferredLocation: item.location,
      quantity: item.unit,
      checked: false,
      defaultShelfLifeDays:
        item.location === 'Freezer' ? 90 : item.location === 'Pantry' ? 60 : 7,
      estimatedValue: item.estimatedValue,
    });
    setToast({ message: `Added ${item.name} to Shopping List` });
  };

  const handleToggleShoppingItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s))
    );
  };

  const handleRemoveShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleStockChecked = () => {
    const checkedItems = shoppingList.filter((s) => s.checked);
    if (checkedItems.length === 0) return;

    const newItems: InventoryItem[] = checkedItems.map((s, idx) => ({
      id: `inv-${Date.now()}-${idx}`,
      name: s.name,
      category: s.category,
      location: s.preferredLocation,
      zoneLabel: s.preferredLocation.toUpperCase(),
      statusHint: 'FRESH STOCK',
      quantity: 1,
      unit: s.quantity || '1 item',
      addedAt: addDaysToToday(0),
      expiresAt: addDaysToToday(s.defaultShelfLifeDays),
      estimatedValue: s.estimatedValue,
    }));

    setInventory((prev) => [...newItems, ...prev]);
    setShoppingList((prev) => prev.filter((s) => !s.checked));
    setToast({ message: `Stocked ${checkedItems.length} items into your kitchen` });
  };

  const spoilageCount = activity.filter((a) => a.action === 'discarded').length;
  const paneerItem = inventory.find((i) => i.id === 'inv-paneer') || inventory[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {/* 1. TOP NAVIGATION BAR (3-Zone Contract) */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#0F172A]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand Mark */}
          <a
            href="#top"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B8A3E]"
          >
            <div className="w-9 h-9 bg-[#0B8A3E] border border-[#0F172A] flex items-center justify-center text-white shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="leading-none">
              <div className="font-display text-lg font-bold tracking-[-0.02em] text-[#0F172A] uppercase">
                EAT BEFORE
              </div>
              <div className="text-[9px] font-bold tracking-[0.08em] text-[#0B8A3E] uppercase mt-0.5">
                INSTANT FRESH PROTOCOL
              </div>
            </div>
          </a>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-[11px] font-bold tracking-[0.06em] uppercase text-[#0F172A]"
          >
            <a
              href="#how-it-works"
              className="hover:text-[#0B8A3E] transition-colors whitespace-nowrap shrink-0"
            >
              HOW IT WORKS
            </a>
            <a
              href="#features"
              className="hover:text-[#0B8A3E] transition-colors whitespace-nowrap shrink-0"
            >
              FEATURES
            </a>
            <a
              href="#live-shelf"
              className="hover:text-[#0B8A3E] transition-colors whitespace-nowrap shrink-0"
            >
              LIVE SHELF
            </a>
            <a
              href="#download-app"
              className="hover:text-[#0B8A3E] transition-colors whitespace-nowrap shrink-0"
            >
              DOWNLOAD APP
            </a>
          </nav>

          {/* Zone 3: Launch Kitchen Action + Profile Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openWorkspace('inventory')}
              className="h-10 px-4 bg-[#0B8A3E] hover:bg-[#065F46] text-white border border-[#0F172A] text-xs font-bold uppercase tracking-[0.04em] flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Utensils className="w-3.5 h-3.5 shrink-0" />
              <span>LAUNCH MY KITCHEN</span>
            </button>
            <button
              type="button"
              onClick={() => openWorkspace('impact')}
              aria-label="Open savings and kitchen profile"
              className="w-10 h-10 bg-[#FACC15] hover:bg-[#EAB308] text-[#0F172A] border border-[#0F172A] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* 2. HERO SPLIT SECTION */}
        <section className="border-b border-[#CBD5E1] bg-[#F8FAFC]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Hero Left */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#0F172A] text-[11px] font-bold tracking-[0.05em] uppercase text-[#0F172A]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B8A3E] shrink-0" />
                <span>SUB-5-SECOND KITCHEN INTAKE PROTOCOL</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[50px] leading-[1.06] font-bold tracking-[-0.03em] uppercase text-[#0F172A] text-balance">
                STOP THROWING GROCERIES AWAY.{' '}
                <span className="inline-block bg-[#0B8A3E] text-[#FACC15] border-2 border-[#0F172A] px-3 py-0.5 mr-1.5 my-1">
                  EAT BEFORE
                </span>
                IT SPOILS.
              </h1>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openWorkspace('inventory')}
                  className="h-12 px-5 bg-[#0B8A3E] hover:bg-[#065F46] text-white border border-[#0F172A] text-xs font-bold uppercase tracking-[0.05em] flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Zap className="w-4 h-4 text-[#FACC15] shrink-0" />
                  <span>START FREE KITCHEN (NO CARD)</span>
                </button>

                <a
                  href="#live-shelf"
                  className="h-12 px-5 bg-white hover:bg-[#F1F5F9] text-[#0F172A] border border-[#0F172A] text-xs font-bold uppercase tracking-[0.05em] flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <PlayCircle className="w-4 h-4 shrink-0" />
                  <span>INSPECT LIVE FLOW</span>
                </a>
              </div>

              {/* 3 Hero Metric Boxes */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-white border border-[#0F172A] p-3.5">
                  <div className="font-display text-xl sm:text-2xl font-bold text-[#0F172A] tabular-nums">
                    45,000+
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.05em] text-[#64748B]">
                    ACTIVE HOMES
                  </div>
                </div>

                <div className="bg-white border border-[#0F172A] p-3.5">
                  <div className="font-display text-xl sm:text-2xl font-bold text-[#D97706] tabular-nums">
                    91.4%
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.05em] text-[#64748B]">
                    WASTE CUT
                  </div>
                </div>

                <div className="bg-white border border-[#0F172A] p-3.5">
                  <div className="font-display text-xl sm:text-2xl font-bold text-[#0F172A] tabular-nums">
                    ₹4,680
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.05em] text-[#64748B]">
                    AVG SAVED/MO
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Right: Live Kitchen Telemetry Preview Card */}
            <div className="lg:col-span-6">
              <div className="bg-white border border-[#0F172A] p-3.5 sm:p-4 space-y-3">
                {/* Top Alert + Saved Strip */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => paneerItem && setSelectedItem(paneerItem)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FEE2E2] border border-[#0F172A] text-[10px] font-bold uppercase tracking-[0.04em] text-[#DC2626] hover:bg-[#FECACA] cursor-pointer whitespace-nowrap"
                  >
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>PANEER: 18H LEFT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openWorkspace('impact')}
                    className="inline-flex items-center px-2.5 py-1 bg-[#FACC15] border border-[#0F172A] text-[10px] font-bold uppercase tracking-[0.04em] text-[#0F172A] tabular-nums cursor-pointer whitespace-nowrap"
                  >
                    SAVED: ₹{savedBaseline.toLocaleString('en-IN')}.00
                  </button>
                </div>

                {/* Framed Family Groceries Visual */}
                <div className="border-2 border-[#0F172A] overflow-hidden bg-[#F4F4F0]">
                  <img
                    src="/images/hero-groceries.png"
                    alt="Family unpacking fresh groceries in kitchen"
                    className="w-full h-56 sm:h-64 object-cover"
                  />
                  <div className="bg-white border-t border-[#0F172A] px-3 py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.04em] text-[#0F172A]">
                      <span className="w-2 h-2 rounded-full bg-[#0B8A3E] shrink-0" />
                      <span>FAMILY DINNER PREP ALERT</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openWorkspace('use-soon')}
                      className="px-2 py-0.5 bg-[#0B8A3E] hover:bg-[#065F46] text-white text-[10px] font-bold uppercase tracking-[0.04em] cursor-pointer whitespace-nowrap"
                    >
                      {counts.urgent} ITEMS READY
                    </button>
                  </div>
                </div>

                {/* Bottom 2 Telemetry Tiles */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => openWorkspace('inventory')}
                    className="bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#0F172A] px-3 py-2.5 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                  >
                    <List className="w-4 h-4 text-[#0B8A3E] shrink-0" />
                    <div>
                      <div className="font-display text-sm font-bold text-[#0F172A] tabular-nums">
                        {inventory.length} Items
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#64748B]">
                        ACTIVE TRACKED
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => openWorkspace('impact')}
                    className="bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#0F172A] px-3 py-2.5 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                  >
                    <Leaf className="w-4 h-4 text-[#0B8A3E] shrink-0" />
                    <div>
                      <div className="font-display text-sm font-bold text-[#0F172A] tabular-nums">
                        {spoilageCount} Spoilage
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#64748B]">
                        LAST 28 DAYS
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CORE VALUE ARCHITECTURE (3 PILLARS) */}
        <section id="features" className="border-b border-[#CBD5E1] bg-[#F8FAFC]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="inline-block px-2.5 py-1 bg-[#FACC15] border border-[#0F172A] text-[10px] font-bold uppercase tracking-[0.06em] text-[#0F172A]">
              CORE VALUE ARCHITECTURE
            </div>

            <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-[-0.02em] uppercase text-[#0F172A]">
              THE 3 PILLARS OF FRICTIONLESS FRESHNESS
            </h2>

            <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Pillar 1 */}
              <article className="bg-white border border-[#0F172A] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 pb-3">
                  <span className="px-2 py-0.5 bg-[#FEE2E2] border border-[#0F172A] text-[10px] font-bold uppercase text-[#DC2626]">
                    1 DAY LEFT
                  </span>
                  <span className="px-2 py-0.5 bg-[#FACC15] border border-[#0F172A] text-[10px] font-bold uppercase text-[#0F172A]">
                    SAVE ₹140
                  </span>
                </div>

                <div className="relative border border-[#0F172A] overflow-hidden bg-[#F4F4F0]">
                  <img
                    src="/images/pillar-fridge.png"
                    alt="Family inspecting fridge freshness"
                    className="w-full h-44 object-cover"
                  />
                  <span className="absolute left-2.5 bottom-2.5 px-2 py-0.5 bg-white border border-[#0F172A] text-[9px] font-bold uppercase tracking-[0.04em] text-[#0F172A]">
                    FAMILY FRIDGE TELEMETRY
                  </span>
                </div>

                <div className="pt-4">
                  <span className="inline-block px-2 py-0.5 border border-[#CBD5E1] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-[0.04em] text-[#0F172A]">
                    DETECT • SHELF-LIFE ENGINE
                  </span>
                  <h3 className="mt-2 font-display text-lg font-bold uppercase text-[#0F172A]">
                    CATCH HIDDEN EXPIRY
                  </h3>
                </div>
              </article>

              {/* Pillar 2 */}
              <article className="bg-white border border-[#0F172A] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 pb-3">
                  <span className="px-2 py-0.5 bg-[#0B8A3E] border border-[#0F172A] text-[10px] font-bold uppercase text-white">
                    ₹4,500+ RETAINED
                  </span>
                  <span className="px-2 py-0.5 bg-[#FACC15] border border-[#0F172A] text-[10px] font-bold uppercase text-[#0F172A]">
                    91% CONSUMED
                  </span>
                </div>

                <div className="relative border border-[#0F172A] overflow-hidden bg-[#F4F4F0]">
                  <img
                    src="/images/pillar-cooking.png"
                    alt="Couple cooking saved groceries together"
                    className="w-full h-44 object-cover"
                  />
                  <span className="absolute left-2.5 bottom-2.5 px-2 py-0.5 bg-white border border-[#0F172A] text-[9px] font-bold uppercase tracking-[0.04em] text-[#0F172A]">
                    HOUSEHOLD ROI
                  </span>
                </div>

                <div className="pt-4">
                  <span className="inline-block px-2 py-0.5 border border-[#CBD5E1] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-[0.04em] text-[#0F172A]">
                    RECLAIM • ZERO WASTE
                  </span>
                  <h3 className="mt-2 font-display text-lg font-bold uppercase text-[#0F172A]">
                    SAVE ₹4,500+ MONTHLY
                  </h3>
                </div>
              </article>

              {/* Pillar 3 */}
              <article className="bg-white border border-[#0F172A] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 pb-3">
                  <span className="px-2 py-0.5 bg-white border border-[#0F172A] text-[10px] font-bold uppercase text-[#0F172A]">
                    SUB-5S LOG
                  </span>
                  <span className="px-2 py-0.5 bg-[#DCFCE7] border border-[#0F172A] text-[10px] font-bold uppercase text-[#0B8A3E]">
                    INSTANT SYNC
                  </span>
                </div>

                <div className="relative border border-[#0F172A] overflow-hidden bg-[#F4F4F0]">
                  <img
                    src="/images/hero-groceries.png"
                    alt="1-tap grocery intake in kitchen"
                    className="w-full h-44 object-cover"
                  />
                  <span className="absolute left-2.5 bottom-2.5 px-2 py-0.5 bg-white border border-[#0F172A] text-[9px] font-bold uppercase tracking-[0.04em] text-[#0F172A]">
                    SMART HOUSEHOLD INTAKE
                  </span>
                </div>

                <div className="pt-4">
                  <span className="inline-block px-2 py-0.5 border border-[#CBD5E1] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-[0.04em] text-[#0F172A]">
                    CONNECT • 1-TAP INTAKE
                  </span>
                  <h3 className="mt-2 font-display text-lg font-bold uppercase text-[#0F172A]">
                    1-TAP GROCERY SYNC
                  </h3>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 4. LIVE INTERACTIVE KITCHEN DEMO (YOUR SHELF RIGHT NOW) */}
        <section id="live-shelf" className="border-b border-[#CBD5E1] bg-[#F8FAFC]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#DCFCE7] border border-[#0F172A] text-[10px] font-bold uppercase tracking-[0.06em] text-[#0B8A3E]">
                  <span>LIVE INTERACTIVE KITCHEN DEMO</span>
                </div>
                <h2 className="mt-2.5 font-display text-2xl sm:text-3xl font-bold tracking-[-0.02em] uppercase text-[#0F172A]">
                  YOUR SHELF RIGHT NOW: EAT THIS FIRST
                </h2>
              </div>

              {/* Filter Tabs + Add Item Button */}
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="inline-flex flex-wrap bg-white border border-[#0F172A] p-0.5"
                  role="tablist"
                  aria-label="Filter live shelf"
                >
                  {(
                    [
                      { id: 'all', label: `ALL ITEMS (${counts.all})` },
                      { id: 'urgent', label: `URGENT (${counts.urgent})` },
                      { id: 'fridge', label: `FRIDGE (${counts.fridge})` },
                      { id: 'pantry', label: `PANTRY (${counts.pantry})` },
                    ] as const
                  ).map((tab) => {
                    const active = shelfFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setShelfFilter(tab.id)}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.04em] transition-colors cursor-pointer tabular-nums whitespace-nowrap ${
                          active
                            ? 'bg-[#0F172A] text-white'
                            : 'bg-white text-[#0F172A] hover:bg-[#F1F5F9]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="h-[34px] px-3 bg-[#0B8A3E] hover:bg-[#065F46] text-white border border-[#0F172A] text-[10px] font-bold uppercase tracking-[0.04em] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>LOG ITEM</span>
                </button>
              </div>
            </div>

            {/* 5-Column Product Shelf Grid */}
            {visibleShelfItems.length === 0 ? (
              <div className="bg-white border border-[#0F172A] p-10 text-center space-y-3">
                <p className="font-display text-lg font-bold uppercase text-[#0F172A]">
                  Shelf Filter Clear — Everything Eaten!
                </p>
                <p className="text-sm text-[#64748B]">
                  Add fresh groceries or switch tabs to view remaining kitchen zones.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="h-10 px-4 bg-[#0B8A3E] text-white border border-[#0F172A] text-xs font-bold uppercase cursor-pointer"
                >
                  + LOG GROCERIES
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {visibleShelfItems.slice(0, shelfFilter === 'all' ? 5 : 10).map((item) => (
                  <ShelfCard
                    key={item.id}
                    item={item}
                    onMarkEaten={handleConsumeItem}
                    onSelect={setSelectedItem}
                  />
                ))}
              </div>
            )}

            {shelfFilter === 'all' && visibleShelfItems.length > 5 && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-[#64748B] tabular-nums">
                  Showing top 5 priority shelf items out of {visibleShelfItems.length} active
                </span>
                <button
                  type="button"
                  onClick={() => openWorkspace('inventory')}
                  className="text-xs font-bold uppercase tracking-[0.04em] text-[#0B8A3E] hover:underline cursor-pointer"
                >
                  View All {visibleShelfItems.length} Items in Full Kitchen →
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 5. HOW EAT BEFORE WORKS IN 3 FAST STEPS */}
        <section id="how-it-works" className="border-b border-[#CBD5E1] bg-[#F8FAFC]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="inline-block px-2.5 py-1 bg-white border border-[#0F172A] text-[10px] font-bold uppercase tracking-[0.06em] text-[#0B8A3E]">
              NO SPREADSHEETS • PURE AUTOMATION
            </div>

            <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-[-0.02em] uppercase text-[#0F172A]">
              HOW EAT BEFORE WORKS IN 3 FAST STEPS
            </h2>

            <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Step 1 */}
              <div className="bg-white border border-[#0F172A] p-5 flex flex-col justify-between gap-5">
                <div>
                  <div className="w-10 h-10 bg-[#0B8A3E] border border-[#0F172A] text-white font-display text-xl font-bold flex items-center justify-center">
                    1
                  </div>
                  <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.05em] text-[#0B8A3E]">
                    INTAKE IN &lt; 5S
                  </div>
                  <h3 className="mt-1 font-display text-lg font-bold uppercase text-[#0F172A]">
                    UNPACK &amp; 1-TAP LOG
                  </h3>
                </div>
                <div className="px-3 py-2 bg-[#F1F5F9] border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] flex items-center gap-2">
                  <ScanLine className="w-3.5 h-3.5 text-[#0B8A3E] shrink-0" />
                  <span>Instant Milk, Bread &amp; Greens Detection</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white border border-[#0F172A] p-5 flex flex-col justify-between gap-5">
                <div>
                  <div className="w-10 h-10 bg-[#FACC15] border border-[#0F172A] text-[#0F172A] font-display text-xl font-bold flex items-center justify-center">
                    2
                  </div>
                  <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.05em] text-[#D97706]">
                    SMART NOTIFICATION
                  </div>
                  <h3 className="mt-1 font-display text-lg font-bold uppercase text-[#0F172A]">
                    THE 5:00 PM DINNER PING
                  </h3>
                </div>
                <div className="px-3 py-2 bg-[#F1F5F9] border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                  <span>Zero App Opening Anxiety</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white border border-[#0F172A] p-5 flex flex-col justify-between gap-5">
                <div>
                  <div className="w-10 h-10 bg-white border border-[#0F172A] text-[#0F172A] font-display text-xl font-bold flex items-center justify-center">
                    3
                  </div>
                  <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.05em] text-[#0B8A3E]">
                    LIVE SAVINGS
                  </div>
                  <h3 className="mt-1 font-display text-lg font-bold uppercase text-[#0F172A]">
                    EAT FRESH, SAVE ₹4,500+
                  </h3>
                </div>
                <div className="px-3 py-2 bg-[#F1F5F9] border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5 text-[#0B8A3E] shrink-0" />
                  <span>₹54,000 Average Annual Retained</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FULL-WIDTH GREEN CTA BANNER */}
        <section className="py-12 lg:py-16 bg-[#F8FAFC]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#0B8A3E] border-2 border-[#0F172A] p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-5">
                <div className="inline-block px-3 py-1 bg-white border border-[#0F172A] text-[10px] font-bold uppercase tracking-[0.06em] text-[#0F172A]">
                  START IN 60 SECONDS
                </div>

                <h2 className="font-display text-3xl sm:text-4xl font-bold leading-[1.08] tracking-[-0.02em] uppercase text-white text-balance">
                  READY TO SAVE ₹4,500 EVERY SINGLE MONTH FROM YOUR KITCHEN?
                </h2>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => openWorkspace('inventory')}
                    className="h-12 px-5 bg-[#FACC15] hover:bg-[#EAB308] text-[#0F172A] border border-[#0F172A] text-xs font-bold uppercase tracking-[0.05em] flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Rocket className="w-4 h-4 shrink-0" />
                    <span>LAUNCH KITCHEN FREE</span>
                  </button>

                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.05em] text-white">
                    <CheckSquare className="w-4 h-4 shrink-0" />
                    <span>NO CREDIT CARD REQUIRED • FREE FOREVER PLAN</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <div className="bg-white p-2 rounded-2xl border-2 border-[#0F172A] max-w-[240px] w-full">
                  <img
                    src="/images/cta-fridge.png"
                    alt="Happy family organizing fresh food inside open fridge"
                    className="w-full h-52 object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. FOOTER */}
      <footer id="download-app" className="bg-white border-t border-[#0F172A]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#0B8A3E] border border-[#0F172A] flex items-center justify-center text-white">
                <Clock className="w-4 h-4" />
              </div>
              <span className="font-display text-lg font-bold uppercase tracking-[-0.02em] text-[#0F172A]">
                EAT BEFORE
              </span>
            </div>
            <div className="inline-block px-3 py-1 bg-[#FACC15] border border-[#0F172A] text-[10px] font-bold uppercase tracking-[0.04em] text-[#0F172A]">
              1.2M+ MEALS RESCUED
            </div>
          </div>

          <div className="md:col-span-2 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#0F172A]">
              PLATFORM
            </div>
            <ul className="space-y-2 text-xs font-medium text-[#475569]">
              <li>
                <a href="#how-it-works" className="hover:text-[#0F172A]">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#0F172A]">
                  Smart Features
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openWorkspace('use-soon')}
                  className="hover:text-[#0F172A] cursor-pointer"
                >
                  Urgency Shelf
                </button>
              </li>
              <li>
                <a href="#live-shelf" className="hover:text-[#0F172A]">
                  Interactive Demo
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#0F172A]">
              MISSION
            </div>
            <ul className="space-y-2 text-xs font-medium text-[#475569]">
              <li>
                <button
                  type="button"
                  onClick={() => openWorkspace('impact')}
                  className="hover:text-[#0F172A] cursor-pointer"
                >
                  Zero-Waste Report
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openWorkspace('shopping')}
                  className="hover:text-[#0F172A] cursor-pointer"
                >
                  Grocers &amp; Restock
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openWorkspace('inventory')}
                  className="hover:text-[#0F172A] cursor-pointer"
                >
                  Freshness Standards
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#0F172A]">
                  Common Questions
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#0F172A]">
              GET THE APP
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Get lightning-quick pantry alerts and flash kitchen reminders.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  setToast({
                    message: 'iOS App Store build synced — launch My Kitchen right in browser!',
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#0F172A] flex items-center gap-3 text-left transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-[#0F172A] shrink-0" />
                <div className="leading-tight">
                  <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#64748B]">
                    DOWNLOAD ON
                  </div>
                  <div className="text-xs font-bold text-[#0F172A]">
                    Apple App Store
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setToast({
                    message: 'Google Play build synced — launch My Kitchen right in browser!',
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#0F172A] flex items-center gap-3 text-left transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-[#0B8A3E] shrink-0" />
                <div className="leading-tight">
                  <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#64748B]">
                    GET IT ON
                  </div>
                  <div className="text-xs font-bold text-[#0F172A]">
                    Google Play Store
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-[#CBD5E1] bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#64748B]">
            <span>
              Eat Before Inc. © 2025. Engineered for maximum freshness and zero household waste.
            </span>
            <div className="flex items-center gap-5 font-bold uppercase tracking-[0.05em] text-[#0F172A] text-[10px]">
              <a href="#top" className="hover:text-[#0B8A3E]">
                PRIVACY POLICY
              </a>
              <a href="#top" className="hover:text-[#0B8A3E]">
                TERMS OF SERVICE
              </a>
              <a href="#top" className="hover:text-[#0B8A3E]">
                SECURITY
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* FULL INTERACTIVE KITCHEN WORKSPACE MODAL */}
      <KitchenWorkspaceModal
        isOpen={workspaceOpen}
        initialTab={workspaceTab}
        onClose={() => setWorkspaceOpen(false)}
        inventory={inventory}
        shoppingList={shoppingList}
        activity={activity}
        onOpenAdd={() => setIsAddOpen(true)}
        onSelectItem={setSelectedItem}
        onConsumeItem={handleConsumeItem}
        onDiscardItem={handleDiscardItem}
        onFreezeSave={handleFreezeSave}
        onBatchConsume={handleBatchConsume}
        onAddShoppingItem={handleAddShoppingItem}
        onToggleShoppingItem={handleToggleShoppingItem}
        onRemoveShoppingItem={handleRemoveShoppingItem}
        onStockChecked={handleStockChecked}
        onUndoEntry={handleUndoActivity}
      />

      {/* ADD ITEM SHEET */}
      <AddItemSheet
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddItem}
      />

      {/* ITEM DETAIL MODAL */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onUpdate={handleUpdateItem}
        onFreezeSave={handleFreezeSave}
        onConsume={handleConsumeItem}
        onDiscard={handleDiscardItem}
        onAddToShopping={handleAddFromInventoryToShopping}
      />

      {/* ACTION TOAST WITH UNDO */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 left-5 sm:left-auto z-[60] sm:max-w-sm bg-[#0F172A] text-white border border-[#0F172A] px-4 py-3 flex items-center justify-between gap-3 elevation-sheet"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-[#FACC15] shrink-0" />
            <span className="text-xs font-bold truncate">{toast.message}</span>
          </div>
          {toast.undoEntry && (
            <button
              type="button"
              onClick={() => {
                handleUndoActivity(toast.undoEntry!);
                setToast(null);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FACC15] text-[#0F172A] text-[11px] font-bold uppercase shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>UNDO</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
