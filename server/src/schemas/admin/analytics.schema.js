const { z } = require('zod');
const { isValidYMDDate } = require('../../utils/dateUtils');

const dateValidationRefine = (date) => !date || isValidYMDDate(date);

const validDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().refine(
  dateValidationRefine,
  { message: 'Invalid date format or invalid date value' }
);

const overviewQuerySchema = z.object({
  dateFrom: validDateString,
  dateTo: validDateString,
});

const dailyDateParamSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').refine(
    dateValidationRefine,
    { message: 'Invalid date format or invalid date value' }
  ),
});

module.exports = {
  overviewQuerySchema,
  dailyDateParamSchema,
};

