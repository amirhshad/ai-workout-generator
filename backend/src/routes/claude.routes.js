const express = require('express');
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const User = require('../models/user.model');
const Workout = require('../models/workout.model');

const router = express.Router();

// Claude API helper function
const claudeAPI = async (prompt, options = {}) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://api.anthropic.com/v1/messages',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      data: {
        model: options.model || 'claude-3-opus-20240229',
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        system: options.system,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
    });

    return response.data;
  } catch (error) {
    console.error('Claude API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to communicate with Claude API');
  }
};

// Build a prompt with workout context
const buildWorkoutPrompt = async (user, options = {}) => {
  // Get the user's preferences
  const { preferences } = user;
  
  // Get recent workouts for context (optional)
  let recentWorkoutsContext = '';
  if (options.includeRecentWorkouts) {
    const recentWorkouts = await Workout.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(3);
    
    if (recentWorkouts.length > 0) {
      recentWorkoutsContext = `\nRecent Workout History:\n`;
      recentWorkouts.forEach((workout, index) => {
        recentWorkoutsContext += `\nWorkout ${index + 1} (${new Date(workout.createdAt).toDateString()}):\n`;
        recentWorkoutsContext += `Name: ${workout.name}\n`;
        recentWorkoutsContext += `Type: ${workout.type}\n`;
        recentWorkoutsContext += `Exercises:\n`;
        workout.exercises.forEach(exercise => {
          recentWorkoutsContext += `- ${exercise.name}: ${exercise.sets} sets of ${exercise.reps}\n`;
        });
      });
    }
  }

  // Get equipment information
  const equipmentList = preferences.availableEquipment && preferences.availableEquipment.length > 0
    ? preferences.availableEquipment.join(', ')
    : 'No specific equipment specified';

  // Build the prompt
  const prompt = `
I need a personalized workout plan based on the following information:

User Fitness Profile:
- Experience Level: ${preferences.experienceLevel || 'beginner'}
- Fitness Goals: ${preferences.fitnessGoals?.join(', ') || 'general fitness'}
- Available Equipment: ${equipmentList}
- Preferred Workout Duration: ${preferences.workoutDuration || 45} minutes
- Workout Frequency: ${preferences.workoutFrequency || 3} days per week

${recentWorkoutsContext}

${options.additionalInstructions || ''}

Please create a detailed workout plan with the following information:
1. Workout name
2. Brief description of the workout focus
3. Workout type (strength, hypertrophy, endurance, etc.)
4. List of exercises with:
   - Exercise name
   - Number of sets
   - Rep range
   - Rest period between sets
   - Any specific instructions or form cues
5. Optional notes or tips

Format each exercise as follows:
Exercise Name: [name]
Sets: [number]
Reps: [range or specific number]
Rest: [time in seconds]
Notes: [any special instructions]

The workout should be appropriate for the user's experience level, align with their fitness goals, and be achievable with the available equipment.
`;

  return prompt;
};

// Parse Claude's response to extract structured workout data
const parseWorkoutResponse = (response) => {
  try {
    const content = response.content || '';
    
    // Extract workout name (usually in the first few lines)
    const nameMatch = content.match(/(?:^|\n)(?:Workout|WORKOUT|#)[\s:]*([^\n]+)/i);
    const name = nameMatch ? nameMatch[1].trim() : 'Generated Workout';
    
    // Extract workout type
    const typeMatch = content.match(/(?:type|TYPE)[\s:]*([^\n]+)/i);
    const type = typeMatch 
      ? typeMatch[1].trim().toLowerCase() 
      : content.toLowerCase().includes('strength') 
        ? 'strength' 
        : content.toLowerCase().includes('hypertrophy') 
          ? 'hypertrophy' 
          : 'general';
    
    // Extract description
    const descMatch = content.match(/(?:description|focus|DESCRIPTION|FOCUS)[\s:]*([^\n]+(?:\n[^\n#]+)*)/i);
    const description = descMatch ? descMatch[1].trim() : '';
    
    // Extract exercises - this is more complex and might need refinement
    const exercises = [];
    
    // Look for patterns that indicate exercises
    const exerciseBlocks = content.split(/\n(?:\d+\.|Exercise|EXERCISE)/).slice(1);
    
    exerciseBlocks.forEach(block => {
      // Extract exercise name
      const nameMatch = block.match(/(?:^|name[\s:]+)([^\n:]+)/i);
      if (!nameMatch) return;
      
      const name = nameMatch[1].trim();
      
      // Extract sets
      const setsMatch = block.match(/sets[\s:]+(\d+)/i);
      const sets = setsMatch ? parseInt(setsMatch[1]) : 3;
      
      // Extract reps
      const repsMatch = block.match(/reps[\s:]+([^\n]+)/i);
      const reps = repsMatch ? repsMatch[1].trim() : '8-12';
      
      // Extract rest
      const restMatch = block.match(/rest[\s:]+([^\n]+)/i);
      const restSeconds = restMatch 
        ? restMatch[1].includes('sec') 
          ? parseInt(restMatch[1]) 
          : restMatch[1].includes('min') 
            ? parseInt(restMatch[1]) * 60 
            : 60
        : 60;
      
      // Extract notes
      const notesMatch = block.match(/notes[\s:]+([^\n]+(?:\n[^#\d]+)*)/i);
      const notes = notesMatch ? notesMatch[1].trim() : '';
      
      exercises.push({
        name,
        sets,
        reps,
        restSeconds,
        notes,
        weight: 'As appropriate',
      });
    });
    
    // If no exercises were found with the above pattern, try a simpler approach
    if (exercises.length === 0) {
      const exerciseMatches = content.match(/[^\n]+(?=\nSets[\s:]+\d+)/g);
      if (exerciseMatches) {
        exerciseMatches.forEach(name => {
          const exerciseBlock = content.substring(content.indexOf(name));
          
          // Extract sets
          const setsMatch = exerciseBlock.match(/Sets[\s:]+(\d+)/i);
          const sets = setsMatch ? parseInt(setsMatch[1]) : 3;
          
          // Extract reps
          const repsMatch = exerciseBlock.match(/Reps[\s:]+([^\n]+)/i);
          const reps = repsMatch ? repsMatch[1].trim() : '8-12';
          
          exercises.push({
            name: name.trim(),
            sets,
            reps,
            restSeconds: 60,
            notes: '',
            weight: 'As appropriate',
          });
        });
      }
    }
    
    return {
      name,
      description,
      type,
      exercises,
      duration: 45, // Default duration
      notes: '',
    };
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    throw new Error('Failed to parse workout from Claude response');
  }
};

/**
 * @route   POST /api/claude/generate-workout
 * @desc    Generate a workout using Claude
 * @access  Private
 */
router.post(
  '/generate-workout',
  asyncHandler(async (req, res) => {
    const {
      additionalInstructions,
      includeRecentWorkouts = true,
      model = 'claude-3-opus-20240229',
      temperature = 0.7,
    } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Build the prompt
    const prompt = await buildWorkoutPrompt(user, {
      additionalInstructions,
      includeRecentWorkouts,
    });

    // Call Claude API
    const claudeResponse = await claudeAPI(prompt, {
      model,
      temperature,
      system: "You are a certified personal trainer and exercise specialist. Your job is to create effective, tailored workout plans based on the user's fitness profile. Be precise, practical, and focus on scientifically-backed exercise prescriptions.",
    });

    // Parse the response to get structured workout data
    const parsedWorkout = parseWorkoutResponse(claudeResponse.content[0]);

    // Create a new workout in our database
    const workout = await Workout.create({
      user: user._id,
      name: parsedWorkout.name,
      description: parsedWorkout.description,
      type: parsedWorkout.type,
      exercises: parsedWorkout.exercises,
      duration: user.preferences.workoutDuration || 45,
      generatedBy: 'ai',
      aiPrompt: prompt,
      aiResponse: JSON.stringify(claudeResponse),
    });

    res.status(201).json({
      success: true,
      workout,
      rawResponse: claudeResponse,
    });
  })
);

/**
 * @route   POST /api/claude/custom-prompt
 * @desc    Send a custom prompt to Claude
 * @access  Private
 */
router.post(
  '/custom-prompt',
  asyncHandler(async (req, res) => {
    const { prompt, model = 'claude-3-opus-20240229', temperature = 0.7 } = req.body;

    if (!prompt) {
      res.status(400);
      throw new Error('Prompt is required');
    }

    // Call Claude API
    const claudeResponse = await claudeAPI(prompt, { model, temperature });

    res.json({
      success: true,
      response: claudeResponse,
    });
  })
);

module.exports = router; 