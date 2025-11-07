const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole } = require('../../controllers/admin/user.controller');
const { isAdmin } = require('../../middlewares/auth');

router.get('/', isAdmin, getAllUsers);
router.patch('/:id/role', isAdmin, updateUserRole);

module.exports = router;
