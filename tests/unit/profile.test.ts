import { describe, expect, it } from 'vitest';
import type { AuthUser } from '../../api/_lib/auth';
import {
  applyAttempt,
  averagePercentage,
  defaultProfile,
  deriveUsername,
  type AttemptSummary,
} from '../../api/_lib/profile';

const user: AuthUser = {
  uid: 'user-12345678',
  email: 'student@example.com',
  emailVerified: true,
  token: {
    name: 'Ada Student',
  } as unknown as AuthUser['token'],
};

const attempt: AttemptSummary = {
  id: 'session-1',
  examId: 'jamb-math-1',
  title: 'JAMB Mathematics',
  subject: 'Mathematics',
  score: 8,
  totalQuestions: 10,
  percentage: 80,
  completedAt: '2026-11-15T10:00:00.000Z',
};

describe('profile aggregation', () => {
  it('derives a safe default username from the display name', () => {
    expect(deriveUsername('Ada Lovelace', 'ada@example.com', 'uid')).toBe(
      'Ada Lovelace',
    );
    expect(deriveUsername(undefined, 'ada@example.com', 'uid')).toBe('ada');
    expect(deriveUsername('x', undefined, 'abcdefghijk')).toBe(
      'student-abcdefgh',
    );
  });

  it('updates overall stats, subject progress and recent attempts', () => {
    const profile = defaultProfile(user);
    const updates = applyAttempt(profile, attempt);

    expect(updates.stats).toEqual({
      completedExams: 1,
      totalQuestions: 10,
      correctAnswers: 8,
      averagePercentage: 80,
      lastAttemptAt: attempt.completedAt,
    });
    expect(updates.progress.Mathematics).toEqual({
      attempts: 1,
      correctAnswers: 8,
      totalQuestions: 10,
      averagePercentage: 80,
      lastAttemptAt: attempt.completedAt,
    });
    expect(updates.recentAttempts).toEqual([attempt]);
  });

  it('accumulates attempts and keeps only the latest ten', () => {
    let profile = defaultProfile(user);

    for (let index = 0; index < 12; index += 1) {
      const current: AttemptSummary = {
        ...attempt,
        id: `session-${index}`,
        score: index % 2 === 0 ? 5 : 10,
        percentage: index % 2 === 0 ? 50 : 100,
        completedAt: `2026-11-15T10:${String(index).padStart(2, '0')}:00.000Z`,
      };
      const updates = applyAttempt(profile, current);
      profile = { ...profile, ...updates };
    }

    expect(profile.stats.completedExams).toBe(12);
    expect(profile.stats.totalQuestions).toBe(120);
    expect(profile.stats.correctAnswers).toBe(90);
    expect(profile.stats.averagePercentage).toBe(75);
    expect(profile.recentAttempts).toHaveLength(10);
    expect(profile.recentAttempts[0]?.id).toBe('session-11');
    expect(profile.recentAttempts[9]?.id).toBe('session-2');
  });

  it('rounds averages to one decimal place', () => {
    expect(averagePercentage(1, 3)).toBe(33.3);
    expect(averagePercentage(2, 3)).toBe(66.7);
    expect(averagePercentage(0, 0)).toBe(0);
  });
});
