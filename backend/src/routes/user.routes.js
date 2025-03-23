const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes already have authMiddleware applied from index.js

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put(
  '/preferences',
  asyncHandler(async (req, res) => {
    const {
      fitnessGoals,
      workoutFrequency,
      workoutDuration,
      availableEquipment,
      experienceLevel,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Update user preferences
    user.preferences = {
      fitnessGoals: fitnessGoals || user.preferences.fitnessGoals,
      workoutFrequency: workoutFrequency || user.preferences.workoutFrequency,
      workoutDuration: workoutDuration || user.preferences.workoutDuration,
      availableEquipment: availableEquipment || user.preferences.availableEquipment,
      experienceLevel: experienceLevel || user.preferences.experienceLevel,
    };

    const updatedUser = await user.save();

    res.json({
      preferences: updatedUser.preferences,
    });
  })
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Update user info
    user.name = name || user.name;
    user.email = email || user.email;
    if (password) {
      user.password = password; // Will be hashed by pre-save middleware
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      preferences: updatedUser.preferences,
    });
  })
);

module.exports = router; 