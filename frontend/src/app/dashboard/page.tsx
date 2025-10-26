'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
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
  createdAt: string;
  scheduledDate?: string;
  completed: boolean;
}

export default function DashboardPage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchWorkouts();
  }, [user, router]);

  const fetchWorkouts = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/workouts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }

      const data = await response.json();
      setWorkouts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/workouts/${workoutId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete workout');
      }

      // Remove from local state
      setWorkouts(workouts.filter(w => w._id !== workoutId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete workout');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading workouts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Workouts</h1>
          <p className="mt-2 text-gray-600">
            View and manage your AI-generated workout plans
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <Link
            href="/create-plan"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Workout
          </Link>
        </div>

        {workouts.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No workouts</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new workout plan.
            </p>
            <div className="mt-6">
              <Link
                href="/create-plan"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Workout
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workouts.map((workout) => (
              <div
                key={workout._id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {workout.name}
                    </h3>
                    {workout.completed && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Type:</span> {workout.type}
                  </p>

                  {workout.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {workout.description}
                    </p>
                  )}

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <svg className="mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Created {formatDate(workout.createdAt)}
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      href={`/workouts/${workout._id}`}
                      className="flex-1 text-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(workout._id)}
                      className="flex-1 px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
