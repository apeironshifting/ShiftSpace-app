import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

const supabaseUrl = 'https:ayxqdqqjaokammzjtzat.supabase.co';
const supabaseAnonKey = 'sb_publishable_PNwLJfSA7xHWeOs2jHu4MQ_euTIGjoX';

export const supabase = createBrowserClient<Database>(supabaseUrl1, supabaseAnonKey);
