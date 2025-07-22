import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { scheduleCard } from '@/lib/sm2-scheduler'


export async function POST(request: NextRequest) {
  const { flashcard_id, quality, user_id } = await request.json()

  try {
    // Fetch current flashcard
    const { data: flashcard, error: fetchError } = await supabase
      .from('flashcards')
      .select('*')
      .eq('id', flashcard_id)
      .eq('owner_id', user_id)
      .single()

    if (fetchError) throw fetchError

    // Calculate new schedule using SM-2
    const updatedSchedule = scheduleCard(flashcard, quality)

    // Update flashcard with new schedule
    const { error: updateError } = await supabase
      .from('flashcards')
      .update(updatedSchedule)
      .eq('id', flashcard_id)

    if (updateError) throw updateError

    // Record the review
    const { error: reviewError } = await supabase
      .from('reviews')
      .insert({
        flashcard_id,
        profile_id: user_id,
        quality
      })

    if (reviewError) throw reviewError

    return NextResponse.json({ success: true, ...updatedSchedule })
  } catch (error) {
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 }

   )
  } 
}
