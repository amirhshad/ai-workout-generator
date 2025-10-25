'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  restPeriod?: number;
  notes?: string;
}

interface Workout {
  _id: string;
  name: string;
  type: string;
  description?: string;
  exercises: Exercise[];
  duration?: number;
  notes?: string;
  createdAt: string;
  scheduledDate?: string;
  completed: boolean;
}

export default function WorkoutDetailPage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (workoutId) {
      fetchWorkout();
    }
  }, [user, workoutId, router]);

  const fetchWorkout = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/workouts/${workoutId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workout');
      }

      const data = await response.json();
      setWorkout(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load workout');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading workout...</div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Workout not found'}</p>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>

        {/* Workout Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{workout.name}</h1>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {workout.type}
                  </span>
                  <span>Created {formatDate(workout.createdAt)}</span>
                </div>
              </div>
              {workout.completed && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              )}
            </div>
            {workout.description && (
              <p className="mt-4 text-gray-600">{workout.description}</p>
            )}
          </div>

          {/* Exercises */}
          <div className="px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Exercises</h2>
            <div className="space-y-4">
              {workout.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <h3 className="text-md font-medium text-gray-900 mb-2">
                    {index + 1}. {exercise.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    {exercise.sets && (
                      <div>
                        <span className="font-medium">Sets:</span> {exercise.sets}
                      </div>
                    )}
                    {exercise.reps && (
                      <div>
                        <span className="font-medium">Reps:</span> {exercise.reps}
                      </div>
                    )}
                    {exercise.weight && (
                      <div>
                        <span className="font-medium">Weight:</span> {exercise.weight} lbs
                      </div>
                    )}
                    {exercise.duration && (
                      <div>
                        <span className="font-medium">Duration:</span> {exercise.duration} min
                      </div>
                    )}
                    {exercise.restPeriod && (
                      <div>
                        <span className="font-medium">Rest:</span> {exercise.restPeriod}s
                      </div>
                    )}
                  </div>
                  {exercise.notes && (
                    <p className="mt-2 text-sm text-gray-600 italic">{exercise.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          {workout.notes && (
            <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{workout.notes}</p>
            </div>
          )}

          {/* Duration */}
          {workout.duration && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="mr-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Estimated Duration: {workout.duration} minutes
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
