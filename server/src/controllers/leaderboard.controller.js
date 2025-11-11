const { LeaderboardService } = require('../services/leaderboard.service');
const { handleError } = require('../utils/handleErrors');

const getStreakLeaderboard = async (req, res) => {
  try {
    const result = await LeaderboardService.getStreakLeaderboard(
      req.query,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    handleError(res, error, 'Failed to get streak leaderboard', 500);
  }
};

const getPointsLeaderboard = async (req, res) => {
  try {
    const result = await LeaderboardService.getPointsLeaderboard(
      req.query,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    handleError(res, error, 'Failed to get points leaderboard', 500);
  }
};

exports.LeaderboardController = {
  getStreakLeaderboard,
  getPointsLeaderboard
};

