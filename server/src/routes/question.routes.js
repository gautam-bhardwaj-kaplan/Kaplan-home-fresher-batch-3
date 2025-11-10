const express = require('express');
const { QuestionController } = require('../controllers/question.controller');
const { validateRequest } = require('../middlewares/validate-request');
const { QuestionSchema } = require('../schemas/question.schema');
const { authenticate } = require('../middlewares/authenticate');

const router = express.Router();

router.get('/today',
  authenticate,
  QuestionController.getTodayQuestion
);

router.post('/:questionId/submit',
  authenticate,
  validateRequest(QuestionSchema.submitAnswerSchema),
  QuestionController.submitAnswer
);

router.get('/history',
  authenticate,
  validateRequest(QuestionSchema.historyQuerySchema, 'query'),
  QuestionController.getHistory
);

module.exports = router;

