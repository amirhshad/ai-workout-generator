'use client';

import Link from 'next/link';

interface WorkoutPlanDisplayProps {
  workoutPlan: string;
  onBack: () => void;
  workoutId?: string;
}

export default function WorkoutPlanDisplay({ workoutPlan, onBack, workoutId }: WorkoutPlanDisplayProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-green-800 font-medium">Workout saved successfully!</span>
        </div>
      </div>

      <button
        onClick={onBack}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Form
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Your Personalized Workout Plan</h2>
        <div className="prose max-w-none">
          {workoutPlan.split('\n').map((line, index) => (
            <p key={index} className="mb-4">
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            Print Plan
          </button>
          {workoutId && (
            <Link
              href={`/workouts/${workoutId}`}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors inline-block"
            >
              View Full Details
            </Link>
          )}
        </div>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors inline-block"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Generate Another Plan
          </button>
        </div>
      </div>
    </div>
  );
} 