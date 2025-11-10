const { z } = require('zod');

const QuestionCategory = z.enum(['MATH', 'ENGLISH', 'CODING', 'SCIENCE', 'GENERAL']);
const Difficulty = z.enum(['EASY', 'MEDIUM', 'HARD']);
const QuestionType = z.enum(['MCQ', 'SHORT_ANSWER']);

const dateValidationRefine = (date) => {
  if (!date) return true;
  const [year, month, day] = date.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);
  return (
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day
  );
};

const requiredValidDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').refine(
  dateValidationRefine,
  { message: 'Invalid date format or invalid date value' }
);

const validDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().refine(
  dateValidationRefine,
  { message: 'Invalid date format or invalid date value' }
);

const createQuestionSchema = z.object({
  scheduledDate: requiredValidDateString,
  category: QuestionCategory,
  difficulty: Difficulty.optional(),
  questionText: z.string().min(1, 'Question text is required').max(1000),
  questionType: QuestionType.optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  acceptedAnswers: z.array(z.string()).optional(),
  caseSensitive: z.boolean().optional(),
  explanation: z.string().optional(),
  points: z.number().int().min(1).max(100).optional(),
});

const updateQuestionSchema = createQuestionSchema.partial().extend({
  isActive: z.boolean().optional(),
});

const listQuestionsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  category: QuestionCategory.optional(),
  dateFrom: validDateString,
  dateTo: validDateString,
  difficulty: Difficulty.optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
  listQuestionsSchema,
};