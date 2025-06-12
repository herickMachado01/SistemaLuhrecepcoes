import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://cajdkqbzeedpsimbodax.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhamRrcWJ6ZWVkcHNpbWJvZGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTA3MzUsImV4cCI6MjA2MzMyNjczNX0.9Dgz4NN2jEkdvdSyV4DK9uaXldo-cjfCt7NlYQkxuTE'; // sua chave pública
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabaseClient;
