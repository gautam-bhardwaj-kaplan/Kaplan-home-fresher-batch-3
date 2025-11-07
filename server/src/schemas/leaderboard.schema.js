const { z } = require('zod');

const leaderboardQuerySchema = z.object({
  period: z.enum(['all', 'week', 'month'])
    .default('all')
    .optional(),
  limit: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === '') return 10;
      const num = parseInt(val, 10);
      return isNaN(num) ? 10 : num;
    },
    z.number().int().min(1).max(100).default(10)
  )
});

exports.LeaderboardSchema = {
  leaderboardQuerySchema
};

