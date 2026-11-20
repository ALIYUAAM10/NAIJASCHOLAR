import { describe, expect, it } from 'vitest';
import type { ExamQuestion } from '../../api/_lib/exams';
import { percentage, scoreAttempt } from '../../api/_lib/scoring';

const questions: ExamQuestion[] = [
  {
    id: 'q1',
    text: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctOption: '4',
    topic: 'Arithmetic',
    explanation: 'Two plus two equals four.',
  },
  {
    id: 'q2',
    text: 'What is 3 x 3?',
    options: ['6', '9', '12'],
    correctOption: '9',
    topic: 'Arithmetic',
  },
];

describe('scoreAttempt', () => {
  it('scores correct, incorrect and unanswered questions', () => {
    const result = scoreAttempt(questions, { q1: '4', q2: '12' });

    expect(result.score).toBe(1);
    expect(result.totalQuestions).toBe(2);
    expect(result.percentage).toBe(50);
    expect(result.review).toEqual([
      {
        questionId: 'q1',
        correctOption: '4',
        selectedOption: '4',
        isCorrect: true,
        explanation: 'Two plus two equals four.',
      },
      {
        questionId: 'q2',
        correctOption: '9',
        selectedOption: '12',
        isCorrect: false,
      },
    ]);
  });

  it('treats missing answers as unanswered and never guesses', () => {
    const result = scoreAttempt(questions, {});

    expect(result.score).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.review[0]?.selectedOption).toBeNull();
    expect(result.review[0]?.isCorrect).toBe(false);
  });

  it('ignores answer keys that do not belong to the exam', () => {
    const result = scoreAttempt(questions, {
      q1: '4',
      q2: '9',
      attacker_question: '4',
    });

    expect(result.score).toBe(2);
    expect(result.review).toHaveLength(2);
  });

  it('returns zero percent for an empty exam', () => {
    expect(scoreAttempt([], {})).toMatchObject({
      score: 0,
      totalQuestions: 0,
      percentage: 0,
      review: [],
    });
    expect(percentage(1, 3)).toBe(33);
  });
});
