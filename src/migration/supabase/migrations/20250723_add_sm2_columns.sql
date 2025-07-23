-- Add SM-2 algorithm columns to flashcards table
ALTER TABLE flashcards 
ADD COLUMN IF NOT EXISTS due_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS ef NUMERIC DEFAULT 2.5,
ADD COLUMN IF NOT EXISTS interval_days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS repetitions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient due card queries
CREATE INDEX IF NOT EXISTS idx_flashcards_user_due 
ON flashcards(user_id, due_at) 
WHERE due_at <= NOW();

-- Create reviews table if not exists
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
  quality INTEGER NOT NULL CHECK (quality >= 0 AND quality <= 5),
  review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  previous_ef NUMERIC,
  previous_interval INTEGER,
  previous_repetitions INTEGER,
  new_ef NUMERIC,
  new_interval INTEGER,
  new_repetitions INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own reviews" ON reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update flashcard stats after review
CREATE OR REPLACE FUNCTION update_flashcard_after_review()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE flashcards 
  SET 
    due_at = NOW() + (NEW.new_interval || ' days')::INTERVAL,
    ef = NEW.new_ef,
    interval_days = NEW.new_interval,
    repetitions = NEW.new_repetitions,
    last_reviewed_at = NOW()
  WHERE id = NEW.flashcard_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update flashcard after review
CREATE TRIGGER trigger_update_flashcard_after_review
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_flashcard_after_review();
