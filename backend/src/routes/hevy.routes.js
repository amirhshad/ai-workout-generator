const express = require('express');
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const User = require('../models/user.model');
const Workout = require('../models/workout.model');

const router = express.Router();

// Hevy API helper function
const hevyAPI = async (user, endpoint, method = 'GET', data = null) => {
  try {
    // Check if token exists and is valid
    if (!user.hevyTokens || !user.hevyTokens.accessToken) {
      throw new Error('Hevy not connected. Please connect your Hevy account.');
    }

    // Check if token is expired
    if (user.hevyTokens.expiresAt && new Date(user.hevyTokens.expiresAt) < new Date()) {
      // TODO: Implement token refresh logic
      throw new Error('Hevy token expired. Please reconnect your Hevy account.');
    }

    // Make API request
    const config = {
      method,
      url: `${process.env.HEVY_API_BASE_URL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${user.hevyTokens.accessToken}`,
        'Content-Type': 'application/json',
      },
      ...(data && { data }),
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`Hevy API Error: ${message}`);
  }
};

/**
 * @route   POST /api/hevy/connect
 * @desc    Connect user's Hevy account (store tokens)
 * @access  Private
 */
router.post(
  '/connect',
  asyncHandler(async (req, res) => {
    const { accessToken, refreshToken, expiresIn } = req.body;

    if (!accessToken) {
      res.status(400);
      throw new Error('Access token is required');
    }

    // Calculate token expiration
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days

    // Update user with Hevy tokens
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.hevyTokens = {
      accessToken,
      refreshToken,
      expiresAt,
    };

    await user.save();

    res.json({ success: true, message: 'Hevy account connected successfully' });
  })
);

/**
 * @route   GET /api/hevy/workouts
 * @desc    Get user's workouts from Hevy
 * @access  Private
 */
router.get(
  '/workouts',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Get workouts from Hevy API
    const hevyWorkouts = await hevyAPI(user, '/workouts');
    
    res.json(hevyWorkouts);
  })
);

/**
 * @route   POST /api/hevy/workouts
 * @desc    Create a workout in Hevy
 * @access  Private
 */
router.post(
  '/workouts',
  asyncHandler(async (req, res) => {
    const { workoutId } = req.body;
    
    if (!workoutId) {
      res.status(400);
      throw new Error('Workout ID is required');
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Find the workout in our database
    const workout = await Workout.findOne({
      _id: workoutId,
      user: req.user._id,
    });

    if (!workout) {
      res.status(404);
      throw new Error('Workout not found');
    }

    // Format workout for Hevy API
    const hevyWorkoutData = {
      name: workout.name,
      description: workout.description || '',
      exercises: workout.exercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight || 'As appropriate',
        notes: exercise.notes || '',
        // Add other required fields based on Hevy API
      })),
    };

    // Send to Hevy API
    const hevyResponse = await hevyAPI(user, '/workouts', 'POST', hevyWorkoutData);

    // Update our workout with Hevy ID
    workout.hevyWorkoutId = hevyResponse.id;
    await workout.save();

    res.json({
      success: true,
      message: 'Workout sent to Hevy successfully',
      hevyWorkout: hevyResponse,
    });
  })
);

/**
 * @route   GET /api/hevy/stats
 * @desc    Get user's workout stats from Hevy
 * @access  Private
 */
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Get stats from Hevy API
    const hevyStats = await hevyAPI(user, '/stats');
    
    res.json(hevyStats);
  })
);

/**
 * @route   DELETE /api/hevy/disconnect
 * @desc    Disconnect user's Hevy account
 * @access  Private
 */
router.delete(
  '/disconnect',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Remove Hevy tokens
    user.hevyTokens = {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
    };

    await user.save();

    res.json({ success: true, message: 'Hevy account disconnected successfully' });
  })
);

module.exports = router; 