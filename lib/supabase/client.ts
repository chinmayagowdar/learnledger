import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During SSR/build, environment variables might not be available
  // This function should only be called client-side
  if (!supabaseUrl || !supabaseAnonKey) {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      throw new Error('Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
    }
    // During SSR, throw a clear error that will be caught
    throw new Error('Supabase client can only be created in the browser.')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
