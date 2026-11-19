import type { DocumentData } from 'firebase-admin/firestore';
import { z } from 'zod';
import { ApiError } from './errors.js';

const examQuestionSchema = z
  .object({
    id: z.string().min(1).max(100),
    text: z.string().min(1).max(2_000),
    options: z.array(z.string().min(1).max(500)).min(2).max(8),
    correctOption: z.string().min(1).max(500),
    topic: z.string().min(1).max(100),
    explanation: z.string().min(1).max(4_000).optional(),
  })
  .refine((question) => question.options.includes(question.correctOption), {
    message: 'correctOption must be one of the options.',
    path: ['correctOption'],
  });

const examDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  subject: z.string().min(1).max(100),
  examType: z.enum(['JAMB', 'WAEC', 'Post-UTME', 'University']),
  durationMinutes: z.number().int().min(1).max(240),
  published: z.boolean(),
  sample: z.boolean().default(false),
  questions: z.array(examQuestionSchema).min(1).max(100),
});

export type ExamQuestion = z.infer<typeof examQuestionSchema>;
export type ExamDocument = z.infer<typeof examDocumentSchema>;

export interface PublicQuestion {
  id: string;
  text: string;
  options: string[];
  topic: string;
}

export interface PublicExam {
  id: string;
  title: string;
  subject: string;
  examType: ExamDocument['examType'];
  durationMinutes: number;
  questionCount: number;
  sample: boolean;
}

export function parseExam(id: string, data: DocumentData | undefined): ExamDocument {
  const parsed = examDocumentSchema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError(500, 'INTERNAL', `Exam ${id} has invalid content.`);
  }
  return parsed.data;
}

export function toPublicQuestion(question: ExamQuestion): PublicQuestion {
  return {
    id: question.id,
    text: question.text,
    options: [...question.options],
    topic: question.topic,
  };
}

export function toPublicExam(id: string, exam: ExamDocument): PublicExam {
  return {
    id,
    title: exam.title,
    subject: exam.subject,
    examType: exam.examType,
    durationMinutes: exam.durationMinutes,
    questionCount: exam.questions.length,
    sample: exam.sample,
  };
}
