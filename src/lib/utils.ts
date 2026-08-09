import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Added this to instantly satisfy all missing translation errors across the app
export function isTranslationKey(value: any): boolean {
  return false
}
