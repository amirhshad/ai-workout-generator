# AI Workout Generator - Setup Guide

This guide will help you set up and run the AI Workout Generator application locally.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or cloud instance)
- Claude API key from Anthropic
- npm or yarn package manager

## Project Structure

```
ai-workout-generator/
├── backend/          # Node.js/Express API server
├── frontend/         # Next.js React application
└── docs/            # Documentation
```

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
Create a `.env` file in the `backend` directory using `.env.example` as a template:

```bash
cp .env.example .env
```

### 4. Configure environment variables
Edit the `.env` file with your actual values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ai-workout-generator
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/ai-workout-generator

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=30d

# Claude AI API
CLAUDE_API_KEY=sk-ant-api03-your-claude-api-key-here

# Hevy API
HEVY_API_BASE_URL=https://api.hevyapp.com/v1
```

**Important:**
- Replace `your-super-secret-jwt-key-change-this-in-production` with a strong random string
- Replace `sk-ant-api03-your-claude-api-key-here` with your actual Claude API key from https://console.anthropic.com/

### 5. Start the backend server
```bash
npm run dev
```

The backend server should now be running on http://localhost:5000

## Frontend Setup

### 1. Navigate to frontend directory
In a new terminal window:

```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
Create a `.env.local` file in the `frontend` directory:

```bash
cp .env.example .env.local
```

### 4. Configure environment variables
Edit the `.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Note:** We removed the need for `ANTHROPIC_API_KEY` in the frontend since all Claude API calls now go through the backend.

### 5. Start the frontend development server
```bash
npm run dev
```

The frontend should now be running on http://localhost:3000

## Using the Application

### 1. Create an Account
- Navigate to http://localhost:3000
- Click "Get Started Free" or "Sign Up"
- Fill in your name, email, and password
- Click "Create Account"

### 2. Generate a Workout
- After logging in, you'll be redirected to the dashboard
- Click "Create New Workout" or navigate to "Create Plan"
- Fill in the form with:
  - Your fitness level (Beginner/Intermediate/Advanced)
  - Your goals (Build Muscle, Lose Weight, etc.)
  - Available equipment
  - Time available for workouts
  - Any personal information or constraints
- Click "Generate Workout Plan"
- Wait a few seconds for Claude AI to generate your personalized plan

### 3. View and Manage Workouts
- Your generated workout is automatically saved
- View it in the dashboard under "My Workouts"
- Click "View" to see full workout details
- Print workouts for offline use
- Delete workouts you no longer need

## Troubleshooting

### Backend won't start
- **MongoDB connection error**: Make sure MongoDB is running
  - Local: `mongod` or check your MongoDB service
  - Cloud: Verify your MongoDB Atlas connection string
- **Port already in use**: Change the PORT in `.env` to a different value (e.g., 5001)

### Frontend won't connect to backend
- Verify backend is running on http://localhost:5000
- Check that `NEXT_PUBLIC_API_URL` in `.env.local` matches your backend URL
- Check browser console for CORS errors

### Claude API errors
- Verify your `CLAUDE_API_KEY` is correct
- Check your Anthropic account has credits
- View backend console logs for detailed error messages

### JWT/Authentication errors
- Clear browser localStorage and try logging in again
- Verify `JWT_SECRET` is set in backend `.env`
- Check that both servers are running

## Development Scripts

### Backend
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

### Frontend
```bash
npm run dev      # Start Next.js development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Testing the API

You can test the backend API directly using tools like Postman or curl:

### Register a user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get workouts (requires JWT token from login)
```bash
curl http://localhost:5000/api/workouts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Next Steps

After completing Phase 1 setup, you have:
- ✅ Full authentication system
- ✅ AI workout generation via backend
- ✅ User dashboard to manage workouts
- ✅ Workout detail views

### Phase 2 Features (Upcoming)
- Hevy OAuth integration for syncing workouts
- Email verification
- Password reset functionality
- User preferences management UI
- Progress tracking and analytics

## Support

If you encounter issues:
1. Check the console logs (both frontend and backend)
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check that you have a valid Claude API key with credits

## Security Notes

- Never commit `.env` or `.env.local` files to git
- Use strong JWT secrets in production
- Enable HTTPS in production
- Implement rate limiting for production deployments
- Regularly rotate API keys and secrets
