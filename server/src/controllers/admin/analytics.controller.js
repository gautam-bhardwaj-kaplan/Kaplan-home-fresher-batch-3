const analyticsService = require('../../services/admin/analytics.service');
const { handleError } = require('../../utils/handleErrors');

const getOverview = async (req, res) => {
  try {
    const result = await analyticsService.getOverview(req.query);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleError(res, error, 'Error retrieving analytics overview', 500);
  }
};

const getDailyAnalytics = async (req, res) => {
  try {
    const { date } = req.params;
    const result = await analyticsService.getDailyAnalytics(date);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      handleError(res, error, 'No question found for the specified date', 404);
    } else {
      handleError(res, error, 'Error retrieving daily analytics', 500);
    }
  }
};

module.exports = {
  getOverview,
  getDailyAnalytics,
};

