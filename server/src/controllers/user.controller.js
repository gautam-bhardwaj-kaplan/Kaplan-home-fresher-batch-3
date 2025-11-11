const { UserService } = require('../services/user.service');
const { handleError } = require('../utils/handleErrors');

const createUser = async (req, res) => {
  try {
    const result = await UserService.createUser(req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Account created successfully'
    });
  } catch (error) {
    handleError(res, error, 'Failed to create user', 400);
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
    handleError(res, error, 'Authentication failed', 401);
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
    handleError(res, error, 'User profile not found', 404);
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
    handleError(res, error, 'Failed to update profile', 400);
  }
};

const getUserProgress = async (req, res) => {
  try {
    const progress = await UserService.getUserProgress(req.user.userId);
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    handleError(res, error, 'User progress not found', 404);
  }
};

const getUserStatsChart = async (req, res) => {
  try {
    const chart_data = await UserService.getUserStatsChart(req.user.userId, req.query);
    res.status(200).json({
      success: true,
      data: chart_data
    });
  } catch (error) {
    handleError(res, error, 'Failed to get user stats', 500);
  }
};

exports.UserController = {
  createUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserProgress,
  getUserStatsChart
};