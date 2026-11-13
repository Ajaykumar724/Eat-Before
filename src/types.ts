export type StorageLocation = 'Fridge' | 'Freezer' | 'Pantry';

export type FoodCategory =
  | 'Produce'
  | 'Dairy'
  | 'Meat & Fish'
  | 'Bakery'
  | 'Dry Goods'
  | 'Beverages'
  | 'Leftovers'
  | 'Frozen';

export type UrgencyTier = 'critical' | 'soon' | 'fresh';

export type DiscardReason = 'Expired' | 'Spoiled' | 'Other';

export type AppScreen = 'inventory' | 'use-soon' | 'shopping' | 'impact';

export interface InventoryItem {
  id: string;
  name: string;
  category: FoodCategory;
  location: StorageLocation;
  zoneLabel?: string; // e.g., FRIDGE, CRISPER, PANTRY
  statusHint?: string; // e.g., OPENED 2D AGO, RECIPE: SAUTE, FREEZE TO SAVE
  hoursRemaining?: number; // optional exact hours override for <48h items
  image?: string;
  quantity: number;
  unit: string;
  addedAt: string; // YYYY-MM-DD
  expiresAt: string; // YYYY-MM-DD
  estimatedValue: number; // INR ₹
  notes?: string;
}

export interface ActivityEntry {
  id: string;
  itemId: string;
  itemName: string;
  category: FoodCategory;
  location: StorageLocation;
  action: 'consumed' | 'discarded' | 'frozen';
  reason?: DiscardReason;
  estimatedValue: number;
  timestamp: string; // ISO string
  originalItem?: InventoryItem;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: FoodCategory;
  preferredLocation: StorageLocation;
  quantity: string;
  checked: boolean;
  defaultShelfLifeDays: number;
  estimatedValue: number;
}

export interface QuickPreset {
  name: string;
  category: FoodCategory;
  location: StorageLocation;
  quantity: number;
  unit: string;
  shelfLifeDays: number;
  estimatedValue: number;
  barcode?: string;
}
