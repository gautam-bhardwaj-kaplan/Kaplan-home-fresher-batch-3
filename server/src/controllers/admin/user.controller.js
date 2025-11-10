const userService = require('../../services/admin/user.service');
const { handleError } = require('../../utils/handleErrors');

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    handleError(res, error, 'Error fetching users', 500);
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const updatedUser = await userService.updateUserRole(id, role);
    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: updatedUser
    });
  } catch (error) {
    handleError(res, error, 'Error updating user role', 400);
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
};