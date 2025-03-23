import WorkoutPlanForm from '@/components/WorkoutPlanForm';

export default function CreatePlan() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Workout Plan
          </h1>
          <p className="text-lg text-gray-600">
            Fill out the form below to generate a personalized workout plan tailored to your needs.
          </p>
        </div>
        
        <WorkoutPlanForm />
      </div>
    </div>
  );
} 