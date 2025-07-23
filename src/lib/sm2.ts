import { SuperMemo, SuperMemoGrade } from '@kirklin/supermemo2';

export interface FlashcardStats {
  ef: number;
  interval: number;
  repetitions: number;
  due_at: Date;
}

export function calculateNextReview(
  quality: SuperMemoGrade,
  currentEF: number = 2.5,
  currentInterval: number = 1,
  currentReps: number = 0
): FlashcardStats {
  const result = SuperMemo(
    {
      interval: currentInterval,
      repetition: currentReps,
      EFactor: currentEF,
    },
    quality
  );

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + result.interval);

  return {
    ef: result.EFactor,
    interval: result.interval,
    repetitions: result.repetition,
    due_at: dueDate,
  };
}
