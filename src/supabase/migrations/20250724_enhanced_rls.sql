-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can insert own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can update own flashcards" ON flashcards;

-- Create tenant-aware policies
CREATE POLICY "Users can view own flashcards" ON flashcards
  FOR SELECT USING (
    auth.uid() = user_id AND
    (
      -- Free users can see up to 50 cards
      (SELECT plan_type FROM subscriptions WHERE user_id = auth.uid() AND status = 'active') IS NULL
      AND (SELECT COUNT(*) FROM flashcards WHERE user_id = auth.uid()) <= 50
    ) OR (
      -- Paid users can see all their cards
      (SELECT plan_type FROM subscriptions WHERE user_id = auth.uid() AND status = 'active') IS NOT NULL
    )
  );

CREATE POLICY "Users can insert own flashcards" ON flashcards
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (
      -- Free users can create up to 50 cards
      (SELECT plan_type FROM subscriptions WHERE user_id = auth.uid() AND status = 'active') IS NULL
      AND (SELECT COUNT(*) FROM flashcards WHERE user_id = auth.uid()) < 50
    ) OR (
      -- Paid users can create unlimited cards
      (SELECT plan_type FROM subscriptions WHERE user_id = auth.uid() AND status = 'active') IS NOT NULL
    )
  );

CREATE POLICY "Users can update own flashcards" ON flashcards
  FOR UPDATE USING (auth.uid() = user_id);

-- Storage policies for premium content
INSERT INTO storage.buckets (id, name, public) VALUES ('premium-videos', 'premium-videos', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('free-content', 'free-content', true);

-- Premium video access policy
CREATE POLICY "Premium users can access premium videos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'premium-videos' AND
    (SELECT plan_type FROM subscriptions WHERE user_id = auth.uid() AND status = 'active') IN ('basic', 'premium')
  );

-- Free content access policy
CREATE POLICY "Everyone can access free content" ON storage.objects
  FOR SELECT USING (bucket_id = 'free-content');
