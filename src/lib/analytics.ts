import { track } from '@vercel/analytics'

export const trackFlashcardReview = (cardId: string, quality: number) => {
  track('flashcard_review', {
    card_id: cardId,
    quality: quality,
    timestamp: new Date().toISOString()
  })
}

export const trackUserConversion = (tier: string) => {
  track('user_conversion', {
    subscription_tier: tier,
    timestamp: new Date().toISOString()
  })
}
