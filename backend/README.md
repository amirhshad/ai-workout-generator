# Backend Server

This directory contains the Node.js/Express backend server for the AI Workout Generator.

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Setup environment variables:
   ```
   cp .env.example .env
   ```

3. Start development server:
   ```
   npm run dev
   ```

## Structure

- `controllers/`: Request handlers for API endpoints
- `models/`: Database models
- `routes/`: API route definitions
- `services/`: Business logic and external API integrations
- `middleware/`: Express middleware
- `utils/`: Utility functions
- `config/`: Configuration files
