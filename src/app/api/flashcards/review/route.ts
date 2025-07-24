import { createServerSupabase } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { calculateNextReview } from '@/lib/sm2'
import { trackFlashcardReview } from '@/lib/analytics'

export async function POST(request: Request) {
  try {
    const { flashcardId, quality } = await request.json()
    
    if (!flashcardId || quality < 0 || quality > 5) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const supabase = createServerSupabase({ cookies })
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current flashcard stats
    const { data: flashcard, error: flashcardError } = await supabase
      .from('flashcards')
      .select('ef, interval_days, repetitions')
      .eq('id', flashcardId)
      .eq('user_id', user.id)
      .single()

    if (flashcardError || !flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 })
    }

    // Calculate new stats using SM-2
    const newStats = calculateNextReview(
      quality,
      flashcard.ef,
      flashcard.interval_days,
      flashcard.repetitions
    )

    // Insert review record
    const { error: reviewError } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        flashcard_id: flashcardId,
        quality,
        previous_ef: flashcard.ef,
        previous_interval: flashcard.interval_days,
        previous_repetitions: flashcard.repetitions,
        new_ef: newStats.ef,
        new_interval: newStats.interval,
        new_repetitions: newStats.repetitions
      })

    if (reviewError) {
      return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
    }

    // Track analytics
    trackFlashcardReview(flashcardId, quality)

    return NextResponse.json({ 
      success: true,
      nextDue: newStats.due_at,
      interval: newStats.interval
    })

  } catch (error) {
    console.error('Review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
