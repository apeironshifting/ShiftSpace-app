import { clsx, type ClassValue } from "clsx"
import { textToHex } from "lucide-react" // if lucide is used, otherwise omit
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
