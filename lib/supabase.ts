import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Please check your .env file or environment variables.');
}

const finalUrl = supabaseUrl || 'https://lhjmajfzcxorfnrsyeif.supabase.co';
const finalKey = supabaseKey || 'sb_publishable_milcB3J3Y4hGGbnUqBvAoA_Nc_01kH9';

console.log('Initializing Supabase with URL:', finalUrl);

export const supabase = createClient(
  finalUrl,
  finalKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);