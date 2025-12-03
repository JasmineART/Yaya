// Supabase Configuration for Admin Dashboard
// This file initializes the Supabase client for querying orders

// Load Supabase client library from CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

// Supabase configuration
// IMPORTANT: These should be your PUBLIC anon key, not the service role key
// The anon key is safe to use in the browser with Row Level Security (RLS) enabled
const SUPABASE_URL = 'https://your-project.supabase.co'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'your-anon-key'; // Replace with your Supabase anon key

// Initialize Supabase client
let supabaseClient = null;

try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY && 
      !SUPABASE_URL.includes('your-project') && 
      !SUPABASE_ANON_KEY.includes('your-anon-key')) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized');
    
    // Make globally available
    window.supabase = supabaseClient;
  } else {
    console.warn('⚠️ Supabase credentials not configured - set SUPABASE_URL and SUPABASE_ANON_KEY in supabase-config.js');
    console.warn('⚠️ Orders from Stripe payments will not be visible until Supabase is configured');
  }
} catch (error) {
  console.error('❌ Error initializing Supabase:', error);
}

// Export the client
export { supabaseClient };
