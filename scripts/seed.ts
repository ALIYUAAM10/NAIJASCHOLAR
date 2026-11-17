import { Timestamp } from 'firebase-admin/firestore';
import { getDb } from '../api/_lib/firebase-admin';
import { sampleExams } from './sample-content';

async function seed(): Promise<void> {
  const db = getDb();
  let created = 0;
  let updated = 0;

  for (const exam of sampleExams) {
    const { id, ...content } = exam;
    const ref = db.collection('exams').doc(id);
    const existing = await ref.get();
    const now = Timestamp.now();

    await ref.set(
      {
        ...content,
        ...(existing.exists ? {} : { createdAt: now }),
        updatedAt: now,
      },
      { merge: true },
    );

    if (existing.exists) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  console.log(
    `Seed complete: ${created} sample exams created, ${updated} updated.`,
  );
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
