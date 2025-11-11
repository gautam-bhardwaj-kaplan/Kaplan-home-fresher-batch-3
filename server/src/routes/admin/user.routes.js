const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole } = require('../../controllers/admin/user.controller');
const { authenticate, isAdmin } = require('../../middlewares/authenticate');

router.use(authenticate);
router.use(isAdmin);

router.get('/', getAllUsers);
router.patch('/:id/role', updateUserRole);

module.exports = router;
