import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://dummy-project.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "dummy-key";

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
  
export default supabase;
