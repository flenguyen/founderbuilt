import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Define Supabase URL and Anon Key. Replace with your actual Supabase project details.
  // It's recommended to use environment variables for security.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or Anon Key in environment variables.');
  }

  // Create and export the Supabase client instance.
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

