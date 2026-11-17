import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { getDb } from './_lib/firebase-admin.js';
import { withApi } from './_lib/handler.js';
import {
  ensureProfile,
  toProfileResponse,
  type ProfileState,
} from './_lib/profile.js';

const updateProfileSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(
        /^[A-Za-z0-9][A-Za-z0-9 ._-]*$/,
        'Use letters, numbers, spaces, dots, underscores or hyphens.',
      )
      .optional(),
    leaderboardOptIn: z.boolean().optional(),
  })
  .refine(
    (value) => value.username !== undefined || value.leaderboardOptIn !== undefined,
    { message: 'At least one profile field is required.' },
  );

export default withApi(
  async ({ req, res, user }) => {
    if (!user) {
      throw new Error('Authenticated request reached handler without a user.');
    }

    const { profile: existing, created } = await ensureProfile(user.uid, user);
    const profile: ProfileState = { ...existing };

    if ((req.method ?? 'GET') === 'PATCH') {
      const body = updateProfileSchema.parse(req.body);
      const updates: Record<string, unknown> = {};

      if (body.username !== undefined) {
        profile.username = body.username;
        updates.username = body.username;
      }

      if (body.leaderboardOptIn !== undefined) {
        profile.leaderboardOptIn = body.leaderboardOptIn;
        updates.leaderboardOptIn = body.leaderboardOptIn;
      }

      const now = Timestamp.now();
      updates.updatedAt = now;
      await getDb().collection('users').doc(user.uid).set(updates, {
        merge: true,
      });
      profile.updatedAt = now.toDate().toISOString();
    }

    res.status(200).json({
      user: toProfileResponse(user.uid, user, profile),
      created,
    });
  },
  {
    methods: ['GET', 'PATCH'],
    auth: true,
    appCheck: true,
  },
);
