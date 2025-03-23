const HEVY_API_KEY = process.env.NEXT_PUBLIC_HEVY_API_KEY;

interface HevyApiConfig {
  baseUrl: string;
  headers: {
    'Authorization': string;
    'Content-Type': string;
  };
}

const config: HevyApiConfig = {
  baseUrl: 'https://api.hevyapp.com',
  headers: {
    'Authorization': `Bearer ${HEVY_API_KEY}`,
    'Content-Type': 'application/json',
  },
};

export const hevyApi = {
  async getWorkouts() {
    const response = await fetch(`${config.baseUrl}/workouts`, {
      headers: config.headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  async createWorkout(workoutData: any) {
    const response = await fetch(`${config.baseUrl}/workouts`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(workoutData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },
}; 