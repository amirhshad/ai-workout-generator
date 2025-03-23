const mongoose = require('mongoose');

// Exercise schema (sub-document)
const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sets: {
    type: Number,
    required: true,
    min: 1,
  },
  reps: {
    type: String, // Could be '10' or '8-12' or other formats
    required: true,
  },
  weight: {
    type: String, // Could be specific or 'bodyweight' or percentage-based
    default: 'As appropriate',
  },
  restSeconds: {
    type: Number,
    default: 60,
  },
  notes: {
    type: String,
    trim: true,
  },
  hevyExerciseId: {
    type: String, // Reference to Hevy's exercise ID
  },
});

// Workout Plan schema
const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['strength', 'hypertrophy', 'endurance', 'cardio', 'mobility', 'custom'],
      default: 'strength',
    },
    exercises: [exerciseSchema],
    duration: {
      type: Number, // in minutes
      default: 45,
    },
    notes: {
      type: String,
      trim: true,
    },
    generatedBy: {
      type: String,
      enum: ['ai', 'user', 'template'],
      default: 'ai',
    },
    hevyWorkoutId: {
      type: String, // Reference to Hevy's workout ID if sent
    },
    completed: {
      type: Boolean,
      default: false,
    },
    scheduledFor: {
      type: Date,
    },
    aiPrompt: {
      type: String, // The prompt used to generate this workout
    },
    aiResponse: {
      type: String, // The full AI response
    },
  },
  {
    timestamps: true,
  }
);

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout; 