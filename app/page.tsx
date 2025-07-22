'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase.from('profiles').select('*')
      if (error) console.error('Supabase error:', error.message)
      else console.log('Profiles:', data)
    }
    test()
  }, [])

  return <div>Kanchen-Academy is Live 🧠</div>
}
