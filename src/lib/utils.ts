
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isTranslationKey(text: string): boolean {
  if (typeof text !== 'string' || !text) {
    return false;
  }
  return text.startsWith('defaults.') || 
         text.startsWith('dashboard.') || 
         text.startsWith('explore_page.') ||
         text.startsWith('settings.') || 
         text.startsWith('login.') || 
         text.startsWith('info_page.') || 
         text.startsWith('journal_page.') || 
         text.startsWith('waiting_room.') ||
         text.startsWith('templates_page.') || 
         text.startsWith('scripts_page.') || 
         text.startsWith('script_page.') || 
         text.startsWith('place_page.') || 
         text.startsWith('block_editor.') || 
         text.startsWith('profile.') || 
         text.startsWith('chart.') || 
         text.startsWith('signup.') || 
         text.startsWith('poster_page.') ||
         text.startsWith('chat.') ||
         text.startsWith('discussions.') ||
         text.startsWith('common.');
}
