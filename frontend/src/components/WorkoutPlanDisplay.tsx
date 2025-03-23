'use client';

interface WorkoutPlanDisplayProps {
  workoutPlan: string;
  onBack: () => void;
}

export default function WorkoutPlanDisplay({ workoutPlan, onBack }: WorkoutPlanDisplayProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
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

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => window.print()}
          className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
        >
          Print Plan
        </button>
        <button
          onClick={onBack}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Generate Another Plan
        </button>
      </div>
    </div>
  );
} 