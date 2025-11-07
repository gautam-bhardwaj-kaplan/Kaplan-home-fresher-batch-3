const express = require('express');
const router = express.Router();
const { validateRequest } = require('../../middlewares/validate-req');
const { isAdmin } = require('../../middlewares/auth');
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

router.use(isAdmin);

router.post(
  '/',
  validateRequest({ body: createQuestionSchema }),
  createQuestion
);

router.get(
  '/',
  validateRequest({ query: listQuestionsSchema }),
  listQuestions
);

router.get('/:questionId', getQuestionById);

router.patch(
  '/:questionId',
  validateRequest({ body: updateQuestionSchema }),
  updateQuestion
);

router.delete('/:questionId', deleteQuestion);

module.exports = router;