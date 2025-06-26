import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = '';
const supabaseKey = ''; // sua chave pública
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabaseClient;
