import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabase() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: cs => cs.forEach(({ name, value, options }) => store.set(name, value, options)),
      },
    }
  );
}
