/**
 * utils/format.ts
 * Pure formatting utilities for currency, dates, numbers, and text.
 * All formatters are locale-aware and type-safe.
 */

import { format, formatDistanceToNow, parseISO } from "date-fns";
import { DATE_FORMAT, DATETIME_FORMAT } from "@/constants/app";

// ─── Currency ─────────────────────────────────────────────────────────────────

/**
 * Formats a number as Indian Rupee currency.
 * e.g. 1234.5 → "₹1,234.50"
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Formats a number as compact Indian Rupee.
 * e.g. 150000 → "₹1.5L"
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return formatCurrency(amount);
}

// ─── Dates ────────────────────────────────────────────────────────────────────

/**
 * Formats an ISO date string to display date.
 * e.g. "2026-01-15T10:30:00Z" → "15 Jan 2026"
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), DATE_FORMAT);
  } catch {
    return "—";
  }
}

/**
 * Formats an ISO date string to display datetime.
 * e.g. "2026-01-15T10:30:00Z" → "15 Jan 2026, 10:30 AM"
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), DATETIME_FORMAT);
  } catch {
    return "—";
  }
}

/**
 * Returns relative time from now.
 * e.g. "2 hours ago"
 */
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return "—";
  }
}

// ─── Numbers ──────────────────────────────────────────────────────────────────

/**
 * Formats a number with Indian locale.
 * e.g. 12345 → "12,345"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Formats a decimal as percentage.
 * e.g. 10 → "10%", 10.5 → "10.5%"
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

// ─── Order / ID Formatting ────────────────────────────────────────────────────

/**
 * Truncates a long ID/hash for display.
 * e.g. "pay_xyz123abc456" → "pay_xyz...456"
 */
export function formatId(id: string, chars = 8): string {
  if (id.length <= chars * 2) return id;
  return `${id.slice(0, chars)}...${id.slice(-4)}`;
}

/**
 * Formats a phone number for display.
 * e.g. "9876543210" → "+91 98765 43210"
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

// ─── File Size ────────────────────────────────────────────────────────────────

/**
 * Formats bytes to human-readable size.
 * e.g. 1048576 → "1.0 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
