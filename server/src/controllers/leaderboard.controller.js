const { LeaderboardService } = require('../services/leaderboard.service');

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
    res.status(500).json({
      success: false,
      error: {
        message: error.message
      }
    });
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
    res.status(500).json({
      success: false,
      error: {
        message: error.message
      }
    });
  }
};

exports.LeaderboardController = {
  getStreakLeaderboard,
  getPointsLeaderboard
};

