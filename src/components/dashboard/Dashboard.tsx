'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import FlashcardComponent from '@/components/flashcard/FlashcardComponent'
import DueCounter from '@/components/dashboard/DueCounter'
import type { Flashcard, SuperMemoQuality } from '@/types/flashcard'

interface DashboardProps {
  userId: string
}

export default function Dashboard({ userId }: DashboardProps) {
  const [dueCards, setDueCards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchDueCards = async () => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('owner_id', userId)
      .lte('next_review_date', new Date().toISOString())
      .order('next_review_date', { ascending: true })

    if (!error) {
      setDueCards(data || [])
    }
    setIsLoading(false)
  }

  const handleReview = async (quality: SuperMemoQuality) => {
    const currentCard = dueCards[currentCardIndex]
    
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flashcard_id: currentCard.id,
          quality,
          user_id: userId
        })
      })

      if (response.ok) {
        // Move to next card or refresh list
        if (currentCardIndex < dueCards.length - 1) {
          setCurrentCardIndex(currentCardIndex + 1)
        } else {
          await fetchDueCards()
          setCurrentCardIndex(0)
        }
      }
    } catch (error) {
      console.error('Review failed:', error)
    }
  }

  useEffect(() => {
  const fetchDueCards = async () => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('owner_id', userId)
      .lte('next_review_date', new Date().toISOString())
      .order('next_review_date', { ascending: true })

    if (!error) {
      setDueCards(data || [])
    }
    setIsLoading(false)
  }

  fetchDueCards()
}, [userId])

  if (isLoading) {
    return <div className="text-center">Loading your flashcards...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Study Dashboard</h1>
        <DueCounter userId={userId} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Stats cards can go here */}
      </div>

      {dueCards.length > 0 ? (
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 text-center text-sm text-gray-600">
            Card {currentCardIndex + 1} of {dueCards.length}
          </div>
          <FlashcardComponent
            flashcard={dueCards[currentCardIndex]}
            onReview={handleReview}
          />
        </div>
      ) : (
        <div className="text-center text-gray-600">
          <p>No cards due for review right now!</p>
          <p className="mt-2">Come back later or add more cards.</p>
        </div>
      )}
    </div>
  )
}
