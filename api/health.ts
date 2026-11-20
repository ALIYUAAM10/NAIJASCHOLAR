import { withApi } from './_lib/handler.js';

export default withApi(
  async ({ res, requestId }) => {
    res.status(200).json({ status: 'ok', requestId });
  },
  { methods: ['GET'] },
);
