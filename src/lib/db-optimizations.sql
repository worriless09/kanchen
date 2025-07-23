-- Additional performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flashcards_subject_user 
ON flashcards(subject, user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_date_user 
ON reviews(DATE(created_at), user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_status_end 
ON subscriptions(status, current_period_end) 
WHERE status = 'active';

-- Query performance function
CREATE OR REPLACE FUNCTION get_user_dashboard_data(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'due_today', (
      SELECT COUNT(*) FROM flashcards 
      WHERE user_id = p_user_id AND due_at <= NOW()
    ),
    'total_cards', (
      SELECT COUNT(*) FROM flashcards 
      WHERE user_id = p_user_id
    ),
    'reviews_today', (
      SELECT COUNT(*) FROM reviews 
      WHERE user_id = p_user_id AND DATE(created_at) = CURRENT_DATE
    ),
    'subscription_status', (
      SELECT status FROM subscriptions 
      WHERE user_id = p_user_id AND status = 'active'
      ORDER BY created_at DESC LIMIT 1
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
