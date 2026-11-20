import { describe, expect, it } from 'vitest';
import { parseExam, toPublicExam, toPublicQuestion } from '../../api/_lib/exams';

const rawExam = {
  title: 'Sample Mathematics Exam',
  subject: 'Mathematics',
  examType: 'JAMB',
  durationMinutes: 10,
  published: true,
  sample: true,
  questions: [
    {
      id: 'q1',
      text: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctOption: '4',
      topic: 'Arithmetic',
      explanation: 'Two plus two equals four.',
    },
  ],
};

describe('exam public mapping', () => {
  it('strips answer keys and explanations from public questions', () => {
    const exam = parseExam('sample-math', rawExam);
    const questions = exam.questions.map(toPublicQuestion);

    expect(questions).toEqual([
      {
        id: 'q1',
        text: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        topic: 'Arithmetic',
      },
    ]);
    expect(questions[0]).not.toHaveProperty('correctOption');
    expect(questions[0]).not.toHaveProperty('explanation');
  });

  it('returns list metadata without exposing the full question bank', () => {
    const exam = parseExam('sample-math', rawExam);

    expect(toPublicExam('sample-math', exam)).toEqual({
      id: 'sample-math',
      title: 'Sample Mathematics Exam',
      subject: 'Mathematics',
      examType: 'JAMB',
      durationMinutes: 10,
      questionCount: 1,
      sample: true,
    });
  });

  it('rejects malformed exam content instead of serving it', () => {
    expect(() =>
      parseExam('broken', {
        ...rawExam,
        questions: [
          {
            ...rawExam.questions[0],
            correctOption: 'not-an-option',
          },
        ],
      }),
    ).toThrowError('Exam broken has invalid content.');
  });
});
