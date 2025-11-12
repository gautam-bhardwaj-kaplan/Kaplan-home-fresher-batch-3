const { z } = require('zod');

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

