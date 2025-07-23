'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Flashcard {
  id: string
  question: string
  answer: string
  subject: string
}

interface FlashcardReviewProps {
  flashcard: Flashcard
  onReview: (quality: number) => void
}

export default function FlashcardReview({ flashcard, onReview }: FlashcardReviewProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)

  const handleReview = async (quality: number) => {
    setIsReviewing(true)
    try {
      const response = await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcardId: flashcard.id,
          quality
        })
      })

      if (response.ok) {
        onReview(quality)
      }
    } catch (error) {
      console.error('Review failed:', error)
    } finally {
      setIsReviewing(false)
    }
  }

  const qualityButtons = [
    { quality: 0, label: 'Complete Blackout', color: 'bg-red-600' },
    { quality: 1, label: 'Incorrect', color: 'bg-red-400' },
    { quality: 2, label: 'Incorrect (Easy)', color: 'bg-orange-400' },
    { quality: 3, label: 'Correct (Difficult)', color: 'bg-yellow-400' },
    { quality: 4, label: 'Correct', color: 'bg-green-400' },
    { quality: 5, label: 'Perfect', color: 'bg-green-600' }
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-sm text-gray-600">{flashcard.subject}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg font-medium">
          {flashcard.question}
        </div>
        
        {!showAnswer ? (
          <Button 
            onClick={() => setShowAnswer(true)}
            className="w-full"
          >
            Show Answer
          </Button>
        ) : (
          <>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-green-800 mb-2">Answer:</div>
              <div>{flashcard.answer}</div>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">
                How did you perform?
              </div>
              <div className="grid grid-cols-2 gap-2">
                {qualityButtons.map((btn) => (
                  <Button
                    key={btn.quality}
                    onClick={() => handleReview(btn.quality)}
                    disabled={isReviewing}
                    className={`${btn.color} text-white text-xs p-2 h-auto`}
                    variant="outline"
                  >
                    {btn.label}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
