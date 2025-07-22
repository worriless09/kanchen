'use client'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Flashcard, SuperMemoQuality } from '@/types/flashcard'

interface FlashcardProps {
  flashcard: Flashcard
  onReview: (quality: SuperMemoQuality) => void
}

export default function FlashcardComponent({ flashcard, onReview }: FlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false)

  const qualityButtons = [
    { quality: 0 as SuperMemoQuality, label: 'Blackout', color: 'bg-red-600' },
    { quality: 1 as SuperMemoQuality, label: 'Incorrect', color: 'bg-red-400' },
    { quality: 2 as SuperMemoQuality, label: 'Hard', color: 'bg-orange-400' },
    { quality: 3 as SuperMemoQuality, label: 'Good', color: 'bg-yellow-400' },
    { quality: 4 as SuperMemoQuality, label: 'Easy', color: 'bg-green-400' },
    { quality: 5 as SuperMemoQuality, label: 'Perfect', color: 'bg-green-600' }
  ]

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">
            {flashcard.question}
          </h3>
          
          {showAnswer ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-lg">{flashcard.answer}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">How well did you know this?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {qualityButtons.map(({ quality, label, color }) => (
                    <Button
                      key={quality}
                      onClick={() => onReview(quality)}
                      className={`${color} text-white text-xs p-2`}
                      size="sm"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Button 
              onClick={() => setShowAnswer(true)}
              className="w-full"
            >
              Show Answer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
