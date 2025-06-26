import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = '';
const supabaseKey = ''; 
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabaseClient;
