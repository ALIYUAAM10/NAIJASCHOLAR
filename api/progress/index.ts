import { withApi } from '../_lib/handler';
import { ensureProfile } from '../_lib/profile';

export default withApi(
  async ({ res, user }) => {
    if (!user) {
      throw new Error('Authenticated request reached handler without a user.');
    }

    const { profile } = await ensureProfile(user.uid, user);
    const subjects = Object.entries(profile.progress)
      .map(([subject, progress]) => ({ subject, ...progress }))
      .sort((left, right) => left.subject.localeCompare(right.subject));

    res.status(200).json({
      stats: profile.stats,
      subjects,
    });
  },
  {
    methods: ['GET'],
    auth: true,
    appCheck: true,
  },
);
