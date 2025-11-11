const express = require('express');
const router = express.Router();
const { validateRequest } = require('../../middlewares/validate-request');
const { authenticate, isAdmin } = require('../../middlewares/authenticate');
const {
  createQuestionSchema,
  updateQuestionSchema,
  listQuestionsSchema,
} = require('../../schemas/admin/question.schema');
const {
  createQuestion,
  listQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require('../../controllers/admin/question.controller');

router.use(authenticate);
router.use(isAdmin);

router.post(
  '/',
  validateRequest(createQuestionSchema, 'body'),
  createQuestion
);

router.get(
  '/',
  validateRequest(listQuestionsSchema, 'query'),
  listQuestions
);

router.get('/:questionId', getQuestionById);

router.patch(
  '/:questionId',
  validateRequest(updateQuestionSchema, 'body'),
  updateQuestion
);

router.delete('/:questionId', deleteQuestion);

module.exports = router;