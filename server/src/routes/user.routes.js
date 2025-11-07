const express = require('express');
const { UserController } = require('../controllers/user.controller');
const { validateRequest } = require('../middlewares/validate-request');
const { UserSchema } = require('../schemas/user.schema');
const { authenticate } = require('../middlewares/authenticate');

const router = express.Router();

router.post('/signup', 
validateRequest(UserSchema.createUserSchema),
  UserController.createUser
);

router.post('/login',
  validateRequest(UserSchema.loginSchema),
  UserController.loginUser
);

router.get('/me',
  authenticate,
  UserController.getUserProfile
);

router.patch('/me',
  authenticate,
  validateRequest(UserSchema.updateProfileSchema),
  UserController.updateUserProfile
);

router.get('/me/progress',
  authenticate,
  UserController.getUserProgress
);

router.get('/me/stats/chart',
  authenticate,
  validateRequest(UserSchema.statsChartQuerySchema, 'query'),
  UserController.getUserStatsChart
);

module.exports = router;