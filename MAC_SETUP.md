# Running AI Workout Generator on Mac

## Quick Start Guide for Mac

### Prerequisites Check

Open Terminal and check if you have Node.js installed:
```bash
node --version
npm --version
```

If you see version numbers (e.g., v18.x.x), you're good! If not, install Node.js:

**Option 1: Using Homebrew (recommended)**
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

**Option 2: Download from nodejs.org**
- Go to https://nodejs.org/
- Download the LTS version for macOS
- Run the installer

### MongoDB Setup on Mac

You have two options:

#### Option A: MongoDB Atlas (Cloud - Easiest, Recommended)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/ai-workout-generator`)
6. Save this for later!

#### Option B: Local MongoDB

```bash
# Install MongoDB using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB as a service (runs in background)
brew services start mongodb-community

# Or start it manually when needed
mongod --config /usr/local/etc/mongod.conf
```

### Get Claude API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to "API Keys" section
4. Create a new API key
5. Copy and save it securely (starts with `sk-ant-api03-...`)

---

## Running the Application

### 1. Clone/Navigate to Project

```bash
cd ~/path/to/ai-workout-generator
```

### 2. Backend Setup

Open Terminal and run:

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Open .env file in default text editor
open .env
```

Edit the `.env` file with your values:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# If using MongoDB Atlas:
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/ai-workout-generator

# If using local MongoDB:
MONGODB_URI=mongodb://localhost:27017/ai-workout-generator

JWT_SECRET=my-super-secret-key-12345-change-this
JWT_EXPIRES_IN=30d

CLAUDE_API_KEY=sk-ant-api03-your-actual-key-here

HEVY_API_BASE_URL=https://api.hevyapp.com/v1
```

**Important:** Replace `your-username`, `your-password`, and the Claude API key with your actual values!

Save and close the file.

### 3. Start Backend Server

In the same terminal (still in `backend` directory):

```bash
npm run dev
```

You should see:
```
Connected to MongoDB
Server running on port 5000 in development mode
```

**Keep this terminal window open!**

### 4. Frontend Setup

Open a **NEW** Terminal window/tab:

```bash
# Navigate to frontend (adjust path as needed)
cd ~/path/to/ai-workout-generator/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Open .env.local file
open .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Save and close.

### 5. Start Frontend Server

In the same terminal (still in `frontend` directory):

```bash
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- Local:        http://localhost:3000
```

**Keep this terminal window open too!**

---

## Testing the Application

### First Time Setup (2-3 minutes)

1. **Open your browser** and go to: http://localhost:3000

2. **Create an account:**
   - Click "Get Started Free" or "Sign Up"
   - Enter your name, email, and password (at least 6 characters)
   - Click "Create account"
   - You'll be automatically logged in and redirected to the dashboard

3. **Generate your first workout:**
   - Click "Create New Workout" button
   - Fill out the form:
     - Select fitness level (e.g., "Intermediate")
     - Choose goals (e.g., "Build Muscle", "Improve Strength")
     - Select equipment (e.g., "Full Gym Access")
     - Set time available (e.g., 60 minutes)
     - Add personal info (optional): "I prefer compound movements and can workout 4 times a week"
   - Click "Generate Workout Plan"
   - Wait 5-10 seconds for Claude AI to generate your plan

4. **View your workout:**
   - You'll see the generated workout plan
   - It's automatically saved!
   - Click "Go to Dashboard" to see it in your workout library
   - Click "View" on any workout to see full details

5. **Test other features:**
   - Click "View Full Details" to see the detailed workout page
   - Try printing a workout (Print button)
   - Delete a workout (Delete button with confirmation)
   - Create another workout to see multiple in your dashboard
   - Sign out and sign back in to verify authentication works

---

## Troubleshooting

### Backend Issues

**"MongoDB connection error"**
- If using local MongoDB: Make sure it's running
  ```bash
  brew services list | grep mongodb
  # Should show "started"
  ```
  If not running:
  ```bash
  brew services start mongodb-community
  ```
- If using Atlas: Check your connection string format and credentials

**"Port 5000 already in use"**
```bash
# Find what's using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)

# Or change port in backend/.env to 5001
```

**"Claude API error"**
- Check your API key is correct in `backend/.env`
- Verify you have credits in your Anthropic account
- Look at backend terminal for specific error messages

### Frontend Issues

**"Failed to fetch" or connection errors**
- Make sure backend is running (check Terminal 1)
- Verify `NEXT_PUBLIC_API_URL=http://localhost:5000` in `frontend/.env.local`
- Check backend terminal for CORS errors

**"Port 3000 already in use"**
```bash
# Kill process on port 3000
kill -9 $(lsof -ti:3000)
```

**Authentication not working**
- Clear browser data:
  - Open DevTools (Cmd+Option+I)
  - Go to Application → Storage → Clear site data
  - Refresh page
- Make sure `JWT_SECRET` is set in backend `.env`

### View Logs

**Backend logs:**
- Check the terminal where you ran `npm run dev` in backend folder
- Shows MongoDB connections, API requests, errors

**Frontend logs:**
- Open browser DevTools (Cmd+Option+I)
- Go to Console tab
- Shows JavaScript errors, API calls

**Database check:**
If using local MongoDB:
```bash
# Open MongoDB shell
mongosh

# List databases
show dbs

# Use your database
use ai-workout-generator

# See collections
show collections

# View users
db.users.find()

# View workouts
db.workouts.find()
```

---

## Stopping the Application

When you're done testing:

1. Go to each Terminal window
2. Press `Ctrl+C` to stop the server
3. If using local MongoDB and want to stop it:
   ```bash
   brew services stop mongodb-community
   ```

---

## Quick Reference

**Start everything:**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Browser
open http://localhost:3000
```

**Check if servers are running:**
```bash
# Backend health check
curl http://localhost:5000/api/health

# Should return: {"status":"ok","message":"API is running"}
```

---

## Next Steps After Testing

Once you've verified everything works:

1. **Explore the code** - Check out the files in:
   - `backend/src/routes/` - API endpoints
   - `frontend/src/app/` - Pages
   - `frontend/src/components/` - Reusable components

2. **Customize** - Try modifying:
   - Workout generation prompts in `backend/src/routes/claude.routes.js`
   - UI styling in the frontend components
   - Add new features!

3. **Deploy** - When ready for production:
   - Use MongoDB Atlas (already cloud-based)
   - Deploy backend to Railway, Render, or Heroku
   - Deploy frontend to Vercel or Netlify
   - Set environment variables in production

---

## Common Commands Cheat Sheet

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# View running processes on port
lsof -ti:3000
lsof -ti:5000

# Kill process on port
kill -9 $(lsof -ti:3000)

# Check Node/npm versions
node --version
npm --version

# View MongoDB status (if installed locally)
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community

# Stop MongoDB
brew services stop mongodb-community
```

Happy testing! 🎉
