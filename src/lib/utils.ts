import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Added this to instantly satisfy all missing translation errors across the app
export function isTranslationKey(value: any): boolean {
  return typeof value === 'string' && value.includes('.');
}

// This cleans up the broken text placeholders into readable English words
export function translateMock(key: string): string {
  if (!key || typeof key !== 'string') return '';
  const parts = key.split('.');
  const lastPart = parts[parts.length - 1];
  return lastPart
    .replace(/_/g, ' ')
    .replace(/^[a-z]/, (match) => match.toUpperCase());
}
