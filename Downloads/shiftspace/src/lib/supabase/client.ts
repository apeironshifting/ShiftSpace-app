import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabase.co';
const supabaseAnonKey = 'sb_publishable_PbwLfSA7xHWeOs2jHu4MQ_euTIGjox';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
