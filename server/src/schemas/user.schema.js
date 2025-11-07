const { z } = require('zod');

const createUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  email: z.string()
    .email('Invalid email format')
    .max(100, 'Email must not exceed 100 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    )
});

const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format'),
  password: z.string()
    .min(1, 'Password is required')
});

const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .optional(),
  emailNotifications: z.boolean().optional(),
  notificationTime: z.string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format')
    .optional()
});

const statsChartQuerySchema = z.object({
  period: z.enum(['week', 'month', 'year'])
    .default('month')
    .optional(),
  metric: z.enum(['accuracy', 'attempts', 'points'])
    .default('accuracy')
    .optional()
});

exports.UserSchema = {
  createUserSchema,
  loginSchema,
  updateProfileSchema,
  statsChartQuerySchema
};