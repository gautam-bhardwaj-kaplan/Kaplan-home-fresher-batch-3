const usersService = require('../../services/admin/user.service');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await usersService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: { message: "Error fetching users" }
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const updatedUser = await usersService.updateUserRole(id, role);
    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: updatedUser
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(400).json({
      success: false,
      error: { message: error.message || "Error updating role" }
    });
  }
};
