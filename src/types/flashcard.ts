export interface Flashcard {
  id: string
  owner_id: string
  question: string
  answer: string
  repetitions: number
  interval_days: number
  easiness_factor: number
  next_review_date: string | null
  created_at: string
}

export interface Review {
  id: string
  flashcard_id: string
  profile_id: string
  quality: number
  reviewed_at: string
}

export type SuperMemoQuality = 0 | 1 | 2 | 3 | 4 | 5
