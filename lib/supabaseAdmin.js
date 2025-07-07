import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// More detailed debugging
if (process.env.NODE_ENV === 'development') {
  console.log('=== Supabase Admin Debug ===');
  console.log('Current working directory:', process.cwd());
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Supabase URL exists:', !!supabaseUrl);
  console.log('Supabase URL value:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined');
  console.log('Service Role Key exists:', !!supabaseServiceRoleKey);
  console.log('Service Role Key length:', supabaseServiceRoleKey?.length || 0);
  console.log('===========================');
}

// Check if we're in a server-side context
const isServer = typeof window === 'undefined';

if (!supabaseUrl) {
  const errorMsg = 'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your .env.local file.';
  console.error(errorMsg);
  if (isServer) {
    throw new Error(errorMsg);
  }
}

if (!supabaseServiceRoleKey) {
  const errorMsg = 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Please check your .env.local file.';
  console.error(errorMsg);
  if (isServer) {
    throw new Error(errorMsg);
  }
}

// Create a dummy client for client-side to prevent errors
let supabaseAdmin;

if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  // Create a client with anon key for client-side fallback
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && anonKey) {
    console.warn('Using anon key for supabaseAdmin - this should only happen during build or on client-side');
    supabaseAdmin = createClient(supabaseUrl, anonKey);
  } else {
    console.error('Cannot create any Supabase client - missing all credentials');
  }
}

export { supabaseAdmin };