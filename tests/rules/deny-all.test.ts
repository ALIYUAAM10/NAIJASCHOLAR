import { readFileSync } from 'node:fs';
import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getBytes, ref, uploadBytes } from 'firebase/storage';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-naijaprep',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
    storage: {
      rules: readFileSync('storage.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.clearStorage();
});

describe('deny-by-default security rules', () => {
  it('denies anonymous Firestore reads and writes', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(db, 'questions', 'q1')));
    await assertFails(setDoc(doc(db, 'questions', 'q1'), { text: 'blocked' }));
  });

  it('denies authenticated Firestore reads and writes', async () => {
    const db = testEnv.authenticatedContext('user-1').firestore();

    await assertFails(getDoc(doc(db, 'users', 'user-1')));
    await assertFails(setDoc(doc(db, 'users', 'user-1'), { role: 'admin' }));
  });

  it('denies direct Storage reads and writes', async () => {
    const storage = testEnv.unauthenticatedContext().storage();

    await assertFails(getBytes(ref(storage, 'library/test.pdf')));
    await assertFails(
      uploadBytes(ref(storage, 'library/test.pdf'), new Uint8Array([1, 2, 3])),
    );
  });
});
