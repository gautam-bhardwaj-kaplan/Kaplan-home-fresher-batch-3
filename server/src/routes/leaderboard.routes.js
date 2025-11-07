const express = require('express');
const { LeaderboardController } = require('../controllers/leaderboard.controller');
const { validateRequest } = require('../middlewares/validate-request');
const { LeaderboardSchema } = require('../schemas/leaderboard.schema');
const { authenticate } = require('../middlewares/authenticate');

const router = express.Router();

router.get('/streak',
  authenticate,
  validateRequest(LeaderboardSchema.leaderboardQuerySchema, 'query'),
  LeaderboardController.getStreakLeaderboard
);

router.get('/points',
  authenticate,
  validateRequest(LeaderboardSchema.leaderboardQuerySchema, 'query'),
  LeaderboardController.getPointsLeaderboard
);

module.exports = router;

