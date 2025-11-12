const express = require('express');
const router = express.Router();
const { validateRequest } = require('../../middlewares/validate-request');
const { authenticate, isAdmin } = require('../../middlewares/authenticate');
const {
  overviewQuerySchema,
  dailyDateParamSchema,
} = require('../../schemas/admin/analytics.schema');
const {
  getOverview,
  getDailyAnalytics,
} = require('../../controllers/admin/analytics.controller');

router.use(authenticate);
router.use(isAdmin);

router.get(
  '/overview',
  validateRequest(overviewQuerySchema, 'query'),
  getOverview
);

router.get(
  '/daily/:date',
  validateRequest(dailyDateParamSchema, 'params'),
  getDailyAnalytics
);

module.exports = router;

