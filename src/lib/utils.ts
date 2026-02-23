import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns today's date as YYYY-MM-DD in the local timezone.
 * Avoids the UTC shift caused by `new Date().toISOString().split('T')[0]`.
 */
export function getLocalToday(): string {
  const now = new Date()
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
}

/**
 * Extracts the YYYY-MM-DD date portion from a date string.
 * Handles both "2026-02-23" and "2026-02-23T00:00:00+00:00" formats.
 */
export function toDateOnly(dateStr: string): string {
  return dateStr.split('T')[0]
}
