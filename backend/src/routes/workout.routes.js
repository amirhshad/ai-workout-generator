const express = require('express');
const asyncHandler = require('express-async-handler');
const Workout = require('../models/workout.model');

const router = express.Router();

/**
 * @route   GET /api/workouts
 * @desc    Get all workouts for a user
 * @access  Private
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const workouts = await Workout.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(workouts);
  })
);

/**
 * @route   GET /api/workouts/:id
 * @desc    Get a workout by ID
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const workout = await Workout.findById(req.params.id);

    if (workout && workout.user.toString() === req.user._id.toString()) {
      res.json(workout);
    } else {
      res.status(404);
      throw new Error('Workout not found');
    }
  })
);

/**
 * @route   POST /api/workouts
 * @desc    Create a new workout
 * @access  Private
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const {
      name,
      description,
      type,
      exercises,
      duration,
      notes,
      generatedBy,
      scheduledFor,
      aiPrompt,
      aiResponse,
    } = req.body;

    const workout = await Workout.create({
      user: req.user._id,
      name,
      description,
      type,
      exercises,
      duration,
      notes,
      generatedBy: generatedBy || 'user',
      scheduledFor,
      aiPrompt,
      aiResponse,
    });

    if (workout) {
      res.status(201).json(workout);
    } else {
      res.status(400);
      throw new Error('Invalid workout data');
    }
  })
);

/**
 * @route   PUT /api/workouts/:id
 * @desc    Update a workout
 * @access  Private
 */
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const {
      name,
      description,
      type,
      exercises,
      duration,
      notes,
      completed,
      scheduledFor,
      hevyWorkoutId,
    } = req.body;

    const workout = await Workout.findById(req.params.id);

    if (workout && workout.user.toString() === req.user._id.toString()) {
      workout.name = name || workout.name;
      workout.description = description || workout.description;
      workout.type = type || workout.type;
      workout.exercises = exercises || workout.exercises;
      workout.duration = duration || workout.duration;
      workout.notes = notes || workout.notes;
      workout.scheduledFor = scheduledFor || workout.scheduledFor;
      
      if (completed !== undefined) {
        workout.completed = completed;
      }
      
      if (hevyWorkoutId) {
        workout.hevyWorkoutId = hevyWorkoutId;
      }

      const updatedWorkout = await workout.save();
      res.json(updatedWorkout);
    } else {
      res.status(404);
      throw new Error('Workout not found');
    }
  })
);

/**
 * @route   DELETE /api/workouts/:id
 * @desc    Delete a workout
 * @access  Private
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const workout = await Workout.findById(req.params.id);

    if (workout && workout.user.toString() === req.user._id.toString()) {
      await workout.deleteOne();
      res.json({ message: 'Workout removed' });
    } else {
      res.status(404);
      throw new Error('Workout not found');
    }
  })
);

module.exports = router; 