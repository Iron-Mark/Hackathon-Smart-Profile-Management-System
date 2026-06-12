import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createDemoSupabaseClient, isDemoSupabaseEnabled } from './demoSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isUsingDemoSupabase = isDemoSupabaseEnabled();

const supabase = isUsingDemoSupabase
  ? createDemoSupabaseClient()
  : createClient(supabaseUrl, supabaseKey);
  
export default supabase as SupabaseClient;
