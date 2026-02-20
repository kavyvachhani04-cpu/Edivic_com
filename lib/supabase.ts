import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lhjmajfzcxorfnrsyeif.supabase.co';
const supabaseKey = 'sb_publishable_milcB3J3Y4hGGbnUqBvAoA_Nc_01kH9';

export const supabase = createClient(supabaseUrl, supabaseKey);