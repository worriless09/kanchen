// src/lib/supabase/client.ts
import { supabase } from '@supabase/auth-helpers-nextjs'
import { createServerSupabase } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export const createClient = () => supabase<Database>()

export const createServerClient = () => createServerSupabase<Database>({ cookies })

// Helper function to get user session
export async function getSession() {
  const supabase = createServerClient()
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

// Helper function to get user profile
export async function getProfile(userId: string) {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting profile:', error)
    return null
  }
}
