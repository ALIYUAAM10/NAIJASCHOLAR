import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ExamDocument, ExamQuestion } from '../api/_lib/exams';
import { sampleExams } from './sample-content';

export interface SeedExam extends ExamDocument {
  id: string;
}

interface LegacyQuestion {
  id?: string;
  topic?: string;
  q?: string;
  question?: string;
  options?: unknown;
  answer?: number;
  explanation?: string;
}

interface JambSubject {
  name: string;
  slug: string;
  topics: string[];
}

interface CourseUnit {
  code: string;
  title: string;
}

interface CourseGroup {
  name: string;
  levels: Record<string, CourseUnit[]>;
}

const dataRoot = fileURLToPath(new URL('../frontend/public/data', import.meta.url));

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(join(dataRoot, relativePath), 'utf8')) as T;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toExamQuestions(items: LegacyQuestion[], prefix: string): ExamQuestion[] {
  const questions: ExamQuestion[] = [];

  items.forEach((item, index) => {
    const text = String(item.q ?? item.question ?? '').trim();
    const options = Array.isArray(item.options)
      ? item.options.filter(
          (option): option is string =>
            typeof option === 'string' && option.trim().length > 0,
        )
      : [];
    const answerIndex = item.answer;
    const correctOption =
      typeof answerIndex === 'number' ? options[answerIndex] : undefined;

    if (!text || options.length < 2 || !correctOption) return;

    const explanation = String(item.explanation ?? '').trim();
    questions.push({
      id: `${prefix}-${item.id ?? index + 1}`.slice(0, 100),
      text: text.slice(0, 2000),
      options: options.map((option) => option.slice(0, 500)),
      correctOption: correctOption.slice(0, 500),
      topic: String(item.topic ?? 'General').slice(0, 100),
      ...(explanation ? { explanation: explanation.slice(0, 4000) } : {}),
    });
  });

  return questions;
}

function buildLegacyExams(): SeedExam[] {
  const exams: SeedExam[] = [];
  const jambData = readJson<{ subjects: JambSubject[] }>('jamb.json');

  for (const subject of jambData.subjects) {
    const source = readJson<LegacyQuestion[]>(`jamb/${subject.slug}.json`);
    const questions = toExamQuestions(source, `jamb-${subject.slug}`);
    if (!questions.length) continue;

    exams.push({
      id: `jamb-${subject.slug}`,
      title: `${subject.name} Practice`,
      subject: subject.name,
      examType: 'JAMB',
      durationMinutes: 30,
      published: true,
      sample: false,
      questions,
    });

    for (const topic of subject.topics) {
      const topicQuestions = questions.filter((question) => question.topic === topic);
      if (!topicQuestions.length) continue;

      exams.push({
        id: `jamb-${subject.slug}-${slugify(topic)}`,
        title: `${subject.name} · ${topic}`,
        subject: subject.name,
        examType: 'JAMB',
        durationMinutes: 10,
        published: true,
        sample: false,
        questions: topicQuestions,
      });
    }
  }

  const unitsData = readJson<{ courses: CourseGroup[]; gst?: CourseUnit[] }>('units.json');
  const courseTitles = new Map<string, string>();
  for (const course of unitsData.courses) {
    for (const units of Object.values(course.levels)) {
      for (const unit of units) courseTitles.set(unit.code, unit.title);
    }
  }
  for (const unit of unitsData.gst ?? []) courseTitles.set(unit.code, unit.title);

  const questionDir = join(dataRoot, 'questions');
  for (const file of readdirSync(questionDir).filter((name) => name.endsWith('.json'))) {
    const codeFromFile = file.replace(/\.json$/, '').replace(/_/g, ' ');
    const source = readJson<LegacyQuestion[]>(`questions/${file}`);
    const questions = toExamQuestions(source, `course-${slugify(codeFromFile)}`);
    if (!questions.length) continue;

    exams.push({
      id: `course-${slugify(codeFromFile)}`,
      title: `${codeFromFile} · ${courseTitles.get(codeFromFile) ?? 'University Practice'}`,
      subject: codeFromFile,
      examType: 'University',
      durationMinutes: 15,
      published: true,
      sample: false,
      questions,
    });
  }

  const mockSlugs = [
    'english',
    'mathematics',
    'biology',
    'chemistry',
    'physics',
    'government',
    'economics',
    'geography',
    'commerce',
    'literature-in-english',
    'accounting',
    'agricultural-science',
    'crk',
    'irk',
    'further-mathematics',
  ];
  const mockQuestions: ExamQuestion[] = [];
  for (const slug of mockSlugs) {
    const subject = jambData.subjects.find((item) => item.slug === slug);
    const source = readJson<LegacyQuestion[]>(`jamb/${slug}.json`);
    const converted = toExamQuestions(source, `mock-${slug}`);
    for (const question of converted) {
      mockQuestions.push({
        ...question,
        topic: `${subject?.name ?? slug} · ${question.topic}`.slice(0, 100),
      });
    }
  }

  if (mockQuestions.length) {
    exams.push({
      id: 'jamb-full-mock',
      title: 'JAMB Full Mock Exam',
      subject: 'English + Core Subjects',
      examType: 'JAMB',
      durationMinutes: 120,
      published: true,
      sample: false,
      questions: mockQuestions.slice(0, 100),
    });
  }

  return exams;
}

export const legacyExams: SeedExam[] = buildLegacyExams();
export const allSeedExams: SeedExam[] = [...sampleExams, ...legacyExams];
