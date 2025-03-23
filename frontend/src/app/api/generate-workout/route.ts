import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fitnessLevel, goals, equipment, timeAvailable, personalInfo } = body;

    const message = `Generate a detailed workout plan with the following requirements:
    
Fitness Level: ${fitnessLevel}
Goals: ${goals.join(', ')}
Available Equipment: ${equipment.join(', ')}
Time Available: ${timeAvailable} minutes

Personal Information and Constraints:
${personalInfo}

Please provide a workout plan that includes:
1. Warm-up routine
2. Main exercises with sets, reps, and rest periods
3. Cool-down stretches
4. Weekly schedule
5. Notes on proper form and safety
6. Progression recommendations`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const workoutPlan = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Error: Unable to generate workout plan';

    return NextResponse.json({
      workoutPlan,
    });
  } catch (error) {
    console.error('Error generating workout plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate workout plan' },
      { status: 500 }
    );
  }
} 