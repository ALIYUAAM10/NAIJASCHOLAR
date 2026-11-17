import type { ExamDocument } from '../api/_lib/exams';

export interface SampleExam extends ExamDocument {
  id: string;
}

/**
 * Sample content only. Every exam is marked `sample: true` so production
 * imports can be distinguished from reviewed, owner-supplied content.
 */
export const sampleExams: SampleExam[] = [
  {
    id: 'sample-jamb-mathematics',
    title: 'Sample JAMB Mathematics Foundation',
    subject: 'Mathematics',
    examType: 'JAMB',
    durationMinutes: 10,
    published: true,
    sample: true,
    questions: [
      {
        id: 'sample-math-1',
        text: 'Solve: 3x + 5 = 20',
        options: ['x = 3', 'x = 5', 'x = 4', 'x = 6'],
        correctOption: 'x = 5',
        topic: 'Algebra',
        explanation:
          'Subtract 5 from both sides to get 3x = 15, then divide both sides by 3 to get x = 5.',
      },
      {
        id: 'sample-math-2',
        text: 'What is 25% of 120?',
        options: ['30', '25', '20', '15'],
        correctOption: '30',
        topic: 'Percentages',
        explanation:
          '25% is one quarter. One quarter of 120 is 120 / 4 = 30.',
      },
      {
        id: 'sample-math-3',
        text: 'Simplify 2a + 3a - 4a',
        options: ['a', '2a', '3a', '4a'],
        correctOption: 'a',
        topic: 'Algebra',
        explanation:
          'Combine like terms: 2a + 3a = 5a, and 5a - 4a = a.',
      },
      {
        id: 'sample-math-4',
        text: 'If a triangle has angles 90°, 45°, and 45°, what type of triangle is it?',
        options: [
          'Equilateral',
          'Isosceles right',
          'Scalene',
          'Obtuse',
        ],
        correctOption: 'Isosceles right',
        topic: 'Geometry',
        explanation:
          'It has a right angle and two equal angles, so the sides opposite those angles are also equal.',
      },
      {
        id: 'sample-math-5',
        text: 'What is the value of 7²?',
        options: ['14', '49', '56', '63'],
        correctOption: '49',
        topic: 'Indices',
        explanation: '7² means 7 × 7, which equals 49.',
      },
    ],
  },
  {
    id: 'sample-waec-english',
    title: 'Sample WAEC English Comprehension',
    subject: 'English',
    examType: 'WAEC',
    durationMinutes: 10,
    published: true,
    sample: true,
    questions: [
      {
        id: 'sample-english-1',
        text: 'Choose the correct synonym for "abundant".',
        options: ['Scarce', 'Plentiful', 'Tiny', 'Weak'],
        correctOption: 'Plentiful',
        topic: 'Vocabulary',
        explanation:
          '"Abundant" means existing in large quantities, which is closest in meaning to "plentiful".',
      },
      {
        id: 'sample-english-2',
        text: 'The opposite of "ancient" is:',
        options: ['Old', 'Modern', 'Historic', 'Mythic'],
        correctOption: 'Modern',
        topic: 'Antonyms',
        explanation:
          '"Ancient" describes something very old; its opposite is "modern".',
      },
      {
        id: 'sample-english-3',
        text: 'Which sentence is grammatically correct?',
        options: [
          'She go to school yesterday.',
          'She went to school yesterday.',
          'She going to school yesterday.',
          'She gone to school yesterday.',
        ],
        correctOption: 'She went to school yesterday.',
        topic: 'Grammar',
        explanation:
          'The past tense of "go" is "went", so the simple past sentence is correct.',
      },
      {
        id: 'sample-english-4',
        text: 'What is the main idea of a passage?',
        options: [
          'The final word',
          'The central message',
          'The list of names',
          'The title only',
        ],
        correctOption: 'The central message',
        topic: 'Comprehension',
        explanation:
          'The main idea is the central message or point that the passage communicates.',
      },
      {
        id: 'sample-english-5',
        text: 'Which word is a noun?',
        options: ['Quickly', 'Bravery', 'Beautifully', 'Run'],
        correctOption: 'Bravery',
        topic: 'Parts of speech',
        explanation:
          '"Bravery" names a quality, so it is a noun. "Quickly" and "beautifully" are adverbs, and "run" is a verb in this context.',
      },
    ],
  },
];
