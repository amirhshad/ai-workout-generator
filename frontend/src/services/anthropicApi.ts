const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  max_tokens?: number;
  temperature?: number;
}

export const anthropicApi = {
  async generateWorkoutPlan(userPreferences: {
    fitnessLevel: string;
    goals: string[];
    equipment: string[];
    timeAvailable: number;
  }) {
    const messages: Message[] = [
      {
        role: 'user',
        content: `Create a workout plan with the following preferences:
          - Fitness Level: ${userPreferences.fitnessLevel}
          - Goals: ${userPreferences.goals.join(', ')}
          - Available Equipment: ${userPreferences.equipment.join(', ')}
          - Time Available: ${userPreferences.timeAvailable} minutes`
      }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        messages,
        max_tokens: 2000,
        temperature: 0.7
      } as ChatCompletionRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },
}; 