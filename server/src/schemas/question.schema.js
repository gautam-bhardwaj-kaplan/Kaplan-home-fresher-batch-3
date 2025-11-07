const { z } = require('zod');

const submitAnswerSchema = z.object({
  answer: z.string()
    .min(1, 'Answer is required')
    .max(500, 'Answer must not exceed 500 characters'),
  timeSpent: z.preprocess(
    (val) => {
      if (val === undefined || val === null) return undefined;
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      return isNaN(num) ? undefined : num;
    },
    z.number()
      .int('Time spent must be an integer')
      .min(0, 'Time spent cannot be negative')
      .max(3600, 'Time spent cannot exceed 3600 seconds')
      .optional()
  )
});

// Schema for query params in history endpoint
const historyQuerySchema = z.object({
  page: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === '') return 1;
      const num = parseInt(val, 10);
      return isNaN(num) ? 1 : num;
    },
    z.number().int().min(1).default(1)
  ),
  limit: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === '') return 10;
      const num = parseInt(val, 10);
      return isNaN(num) ? 10 : num;
    },
    z.number().int().min(1).max(100).default(10)
  ),
  category: z.enum(['MATH', 'ENGLISH', 'CODING', 'SCIENCE', 'GENERAL'])
    .optional(),
  dateFrom: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  dateTo: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
}).refine(
  (data) => {
    if (data.dateFrom && data.dateTo) {
      return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
  },
  {
    message: 'dateFrom must be before or equal to dateTo',
    path: ['dateFrom']
  }
);

exports.QuestionSchema = {
  submitAnswerSchema,
  historyQuerySchema
};

