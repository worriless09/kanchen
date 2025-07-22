import { sm2, SuperMemoQuality } from '@dtjv/sm-2'
import { addDays } from 'date-fns'
import type { Flashcard } from '@/types/flashcard'

export function scheduleCard(card: Flashcard, quality: SuperMemoQuality) {
  // Prepare card data for SM-2 algorithm
  const cardData = {
    rep: card.repetitions,
    repInterval: card.interval_days,
    easyFactor: card.easiness_factor
  }

  // Run SM-2 algorithm
  const { rep, repInterval, easyFactor } = sm2(cardData, quality)

  // Calculate next review date
  const nextReviewDate = addDays(new Date(), repInterval)

  return {
    repetitions: rep,
    interval_days: repInterval,
    easiness_factor: Math.max(easyFactor, 1.3), // Prevent "ease hell"
    next_review_date: nextReviewDate.toISOString()
  }
}
