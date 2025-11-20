const { QuestionService } = require('../services/question.service');
const { handleError } = require('../utils/handleErrors');


const getTodayQuestion = async (req, res) => {
  try {
    const result = await QuestionService.getTodayQuestion(req.user.userId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    handleError(res, error, 'Failed to get today question', 500);
  }
};


const submitAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const result = await QuestionService.submitAnswer(
      req.user.userId,
      questionId,
      req.body
    );
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Answer submitted successfully'
    });
  } catch (error) {
    handleError(res, error, 'Failed to submit answer', 500);
  }
};


const getHistory = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    
    const queryParams = {
      ...req.query,
      page,
      limit
    };
    
    const result = await QuestionService.getHistory(req.user.userId, queryParams);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    handleError(res, error, 'Failed to get question history', 500);
  }
};

const getQuestionStats = async (_req, res) => {
  try {
    const stats = await QuestionService.getQuestionStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    handleError(res, error, 'Failed to get question stats', 500);
  }
};

exports.QuestionController = {
  getTodayQuestion,
  submitAnswer,
  getHistory,
  getQuestionStats
};

