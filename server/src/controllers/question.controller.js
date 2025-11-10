const { QuestionService } = require('../services/question.service');


const getTodayQuestion = async (req, res) => {
  try {
    const result = await QuestionService.getTodayQuestion(req.user.userId);
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
    res.status(500).json({
      success: false,
      error: {
        message: error.message
      }
    });
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
    res.status(500).json({
      success: false,
      error: {
        message: error.message
      }
    });
  }
};

exports.QuestionController = {
  getTodayQuestion,
  submitAnswer,
  getHistory
};

