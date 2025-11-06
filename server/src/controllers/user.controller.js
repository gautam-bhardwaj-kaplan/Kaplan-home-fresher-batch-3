const { UserService } = require('../services/user.service');

const createUser = async (req, res) => {
  try {
    const result = await UserService.createUser(req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Account created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message
      }
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const result = await UserService.loginUser(req.body);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        message: error.message
      }
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const profile = await UserService.getUserProfile(req.user.userId);
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: error.message
      }
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const updatedProfile = await UserService.updateUserProfile(req.user.userId, req.body);
    res.status(200).json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message
      }
    });
  }
};

exports.UserController = {
  createUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};