const questionService = require('../../services/admin/question.service');
const { handleError } = require('../../utils/handleErrors');

const createQuestion = async (req, res) => {
  try {
    const question = await questionService.createQuestion(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: { question },
      message: 'Question scheduled successfully',
    });
  } catch (error) {
    handleError(res, error, 'Error creating question', 500);
  }
};

const listQuestions = async (req, res) => {
  try {
    const result = await questionService.listQuestions(req.query);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleError(res, error, 'Error retrieving questions', 500);
  }
};

const getQuestionById = async (req, res) => {
  try {
    const { questionId } = req.params;
    const result = await questionService.getQuestionById(questionId);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleError(res, error, 'Error retrieving question', 500);
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await questionService.updateQuestion(questionId, req.body);
    
    res.json({
      success: true,
      data: { question },
      message: 'Question updated successfully',
    });
  } catch (error) {
    handleError(res, error, 'Error updating question', 500);
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    await questionService.deleteQuestion(questionId);
    
    res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    handleError(res, error, 'Error deleting question', 500);
  }
};

module.exports = {
  createQuestion,
  listQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};