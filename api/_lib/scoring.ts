import type { ExamQuestion } from './exams.js';

export interface ReviewItem {
  questionId: string;
  correctOption: string;
  selectedOption: string | null;
  isCorrect: boolean;
  explanation?: string;
}

export interface ScoreResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  review: ReviewItem[];
}

export function percentage(score: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return Math.round((score / totalQuestions) * 100);
}

export function scoreAttempt(
  questions: ExamQuestion[],
  answers: Record<string, string>,
): ScoreResult {
  let score = 0;

  const review = questions.map((question): ReviewItem => {
    const selectedOption = answers[question.id] ?? null;
    const isCorrect = selectedOption === question.correctOption;

    if (isCorrect) score += 1;

    const item: ReviewItem = {
      questionId: question.id,
      correctOption: question.correctOption,
      selectedOption,
      isCorrect,
    };

    if (question.explanation) {
      item.explanation = question.explanation;
    }

    return item;
  });

  return {
    score,
    totalQuestions: questions.length,
    percentage: percentage(score, questions.length),
    review,
  };
}
