const questionsService = require('../../services/admin/question.service');

const createQuestion = async (req, res) => {
  try {
    const question = await questionsService.createQuestion(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: { question },
      message: 'Question scheduled successfully',
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error creating question',
      },
    });
  }
};

const listQuestions = async (req, res) => {
  try {
    const result = await questionsService.listQuestions(req.query);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error listing questions:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error retrieving questions',
      },
    });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const { questionId } = req.params;
    const result = await questionsService.getQuestionById(questionId);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error retrieving question:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error retrieving question',
      },
    });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await questionsService.updateQuestion(questionId, req.body);
    
    res.json({
      success: true,
      data: { question },
      message: 'Question updated successfully',
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error updating question',
      },
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    await questionsService.deleteQuestion(questionId);
    
    res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error deleting question',
      },
    });
  }
};

module.exports = {
  createQuestion,
  listQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};