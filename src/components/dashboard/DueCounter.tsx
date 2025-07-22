'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'

interface DueCounterProps {
  userId: string
}

export default function DueCounter({ userId }: DueCounterProps) {
  const [dueCount, setDueCount] = useState(0)

  useEffect(() => {
    // ✅ Define the function inside useEffect
    const fetchDueCount = async () => {
      const { count, error } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userId)
        .lte('next_review_date', new Date().toISOString())

      if (!error) {
        setDueCount(count || 0)
      }
    }

    // ✅ Call it inside the effect
    fetchDueCount()

    // ✅ Real-time updates
    const channel = supabase
      .channel('due-counter')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flashcards',
          filter: `owner_id=eq.${userId}`,
        },
        () => {
          fetchDueCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId]) // ✅ Now the warning is gone

  return (
    <Badge className="bg-rose-600 text-white">
      <span>{dueCount} due</span>
    </Badge>
  )
}
