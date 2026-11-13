import { UrgencyTier } from '../types';

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToToday(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function getDaysRemaining(expiresAt: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parts = expiresAt.split('-').map(Number);
  const expiry = new Date(parts[0], parts[1] - 1, parts[2]);
  const diffMs = expiry.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getUrgencyTier(expiresAt: string, hoursRemaining?: number): UrgencyTier {
  if (hoursRemaining !== undefined && hoursRemaining <= 18) return 'critical';
  const days = getDaysRemaining(expiresAt);
  if (days < 0) return 'critical';
  if (days <= 3) return 'soon';
  return 'fresh';
}

export function formatUrgencyLabel(expiresAt: string, hoursRemaining?: number): string {
  if (hoursRemaining !== undefined) {
    return `${hoursRemaining}H LEFT`;
  }
  const days = getDaysRemaining(expiresAt);
  if (days < 0) return `${Math.abs(days)}D AGO`;
  if (days === 0) return 'TODAY';
  if (days === 1) return '24H LEFT';
  if (days >= 90) return '90+ DAYS';
  return `${days} DAYS`;
}

export function formatShortDate(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatRelativeTime(isoTimestamp: string): string {
  const now = Date.now();
  const then = new Date(isoTimestamp).getTime();
  const diffMin = Math.max(0, Math.floor((now - then) / 60000));
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}
