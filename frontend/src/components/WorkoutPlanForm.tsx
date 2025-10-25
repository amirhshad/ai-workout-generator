'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import WorkoutPlanDisplay from './WorkoutPlanDisplay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface WorkoutPlanFormData {
  fitnessLevel: string;
  goals: string[];
  equipment: string[];
  timeAvailable: number;
  personalInfo: string;
}

interface FormErrors {
  fitnessLevel?: string;
  goals?: string;
  equipment?: string;
  timeAvailable?: string;
  personalInfo?: string;
}

const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced'];
const availableGoals = [
  'Build Muscle',
  'Lose Weight',
  'Improve Strength',
  'Increase Endurance',
  'General Fitness',
];
const availableEquipment = [
  'None (Bodyweight)',
  'Dumbbells',
  'Barbell',
  'Resistance Bands',
  'Pull-up Bar',
  'Full Gym Access',
];

const MAX_PERSONAL_INFO_LENGTH = 1000;

export default function WorkoutPlanForm() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<WorkoutPlanFormData>({
    fitnessLevel: '',
    goals: [],
    equipment: [],
    timeAvailable: 30,
    personalInfo: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [workoutId, setWorkoutId] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fitnessLevel) {
      newErrors.fitnessLevel = 'Please select your fitness level';
    }

    if (formData.goals.length === 0) {
      newErrors.goals = 'Please select at least one goal';
    }

    if (formData.equipment.length === 0) {
      newErrors.equipment = 'Please select available equipment';
    }

    if (formData.timeAvailable < 15 || formData.timeAvailable > 120) {
      newErrors.timeAvailable = 'Time available must be between 15 and 120 minutes';
    }

    if (formData.personalInfo.length > MAX_PERSONAL_INFO_LENGTH) {
      newErrors.personalInfo = `Personal information must be ${MAX_PERSONAL_INFO_LENGTH} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Check if user is logged in
    if (!user) {
      router.push('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = getToken();

      // Call backend API to generate and save workout
      const response = await fetch(`${API_URL}/api/claude/generate-workout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferences: {
            fitnessLevel: formData.fitnessLevel,
            goals: formData.goals,
            equipment: formData.equipment,
            timeAvailable: formData.timeAvailable,
            personalInfo: formData.personalInfo,
          },
          includeRecentWorkouts: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate workout plan');
      }

      const data = await response.json();

      // The backend returns the saved workout object
      setWorkoutId(data._id);

      // Format workout for display (construct from the workout object)
      const displayPlan = formatWorkoutForDisplay(data);
      setWorkoutPlan(displayPlan);
    } catch (error: any) {
      console.error('Error generating workout plan:', error);
      setApiError(error.message || 'Failed to generate workout plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatWorkoutForDisplay = (workout: any): string => {
    let display = `# ${workout.name}\n\n`;
    display += `**Type:** ${workout.type}\n\n`;

    if (workout.description) {
      display += `**Description:** ${workout.description}\n\n`;
    }

    display += `## Exercises\n\n`;

    workout.exercises.forEach((exercise: any, index: number) => {
      display += `### ${index + 1}. ${exercise.name}\n`;
      if (exercise.sets) display += `- Sets: ${exercise.sets}\n`;
      if (exercise.reps) display += `- Reps: ${exercise.reps}\n`;
      if (exercise.weight) display += `- Weight: ${exercise.weight} lbs\n`;
      if (exercise.duration) display += `- Duration: ${exercise.duration} min\n`;
      if (exercise.restPeriod) display += `- Rest: ${exercise.restPeriod}s\n`;
      if (exercise.notes) display += `- Notes: ${exercise.notes}\n`;
      display += `\n`;
    });

    if (workout.notes) {
      display += `## Additional Notes\n\n${workout.notes}\n`;
    }

    return display;
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal],
    }));
    if (errors.goals) {
      setErrors(prev => ({ ...prev, goals: undefined }));
    }
  };

  const handleEquipmentToggle = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment],
    }));
    if (errors.equipment) {
      setErrors(prev => ({ ...prev, equipment: undefined }));
    }
  };

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, personalInfo: value }));
    if (value.length > MAX_PERSONAL_INFO_LENGTH) {
      setErrors(prev => ({
        ...prev,
        personalInfo: `Maximum ${MAX_PERSONAL_INFO_LENGTH} characters allowed (${value.length}/${MAX_PERSONAL_INFO_LENGTH})`,
      }));
    } else {
      setErrors(prev => ({ ...prev, personalInfo: undefined }));
    }
  };

  if (workoutPlan) {
    return (
      <WorkoutPlanDisplay
        workoutPlan={workoutPlan}
        onBack={() => {
          setWorkoutPlan(null);
          setWorkoutId(null);
        }}
        workoutId={workoutId || undefined}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-8">
      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{apiError}</p>
        </div>
      )}

      {/* Fitness Level */}
      <div className="space-y-4">
        <label className="block text-lg font-semibold">Fitness Level</label>
        <div className="grid grid-cols-3 gap-4">
          {fitnessLevels.map(level => (
            <button
              key={level}
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, fitnessLevel: level }));
                if (errors.fitnessLevel) {
                  setErrors(prev => ({ ...prev, fitnessLevel: undefined }));
                }
              }}
              className={`p-3 rounded-lg border-2 transition-colors ${
                formData.fitnessLevel === level
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        {errors.fitnessLevel && (
          <p className="text-red-500 text-sm mt-1">{errors.fitnessLevel}</p>
        )}
      </div>

      {/* Goals */}
      <div className="space-y-4">
        <label className="block text-lg font-semibold">Goals (Select all that apply)</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableGoals.map(goal => (
            <button
              key={goal}
              type="button"
              onClick={() => handleGoalToggle(goal)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                formData.goals.includes(goal)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
        {errors.goals && (
          <p className="text-red-500 text-sm mt-1">{errors.goals}</p>
        )}
      </div>

      {/* Equipment */}
      <div className="space-y-4">
        <label className="block text-lg font-semibold">Available Equipment</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableEquipment.map(equipment => (
            <button
              key={equipment}
              type="button"
              onClick={() => handleEquipmentToggle(equipment)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                formData.equipment.includes(equipment)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              {equipment}
            </button>
          ))}
        </div>
        {errors.equipment && (
          <p className="text-red-500 text-sm mt-1">{errors.equipment}</p>
        )}
      </div>

      {/* Time Available */}
      <div className="space-y-4">
        <label className="block text-lg font-semibold">
          Time Available (minutes): {formData.timeAvailable}
        </label>
        <input
          type="range"
          min="15"
          max="120"
          step="15"
          value={formData.timeAvailable}
          onChange={e => setFormData(prev => ({ ...prev, timeAvailable: parseInt(e.target.value) }))}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>15 min</span>
          <span>120 min</span>
        </div>
        {errors.timeAvailable && (
          <p className="text-red-500 text-sm mt-1">{errors.timeAvailable}</p>
        )}
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <label className="block text-lg font-semibold">Personal Information</label>
        <p className="text-sm text-gray-600 mb-2">
          Share any relevant information about your lifestyle, schedule, preferences, or limitations 
          (e.g., work hours, family commitments, injuries, preferred workout times, etc.)
        </p>
        <div className="relative">
          <textarea
            value={formData.personalInfo}
            onChange={handlePersonalInfoChange}
            placeholder="Example: I work 9-5 on weekdays, prefer morning workouts, have two young kids, and have a previous knee injury. I can work out 3 times a week, preferably on Mon/Wed/Fri..."
            className={`w-full h-32 p-3 border-2 rounded-lg transition-colors ${
              errors.personalInfo 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
            } focus:ring-1`}
          />
          <div className="absolute bottom-2 right-2 text-sm text-gray-500">
            {formData.personalInfo.length}/{MAX_PERSONAL_INFO_LENGTH}
          </div>
        </div>
        {errors.personalInfo && (
          <p className="text-red-500 text-sm mt-1">{errors.personalInfo}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !formData.fitnessLevel || formData.goals.length === 0 || formData.equipment.length === 0}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold 
                 hover:bg-blue-700 transition-colors disabled:bg-gray-400"
      >
        {loading ? 'Generating Plan...' : 'Generate Workout Plan'}
      </button>
    </form>
  );
} 