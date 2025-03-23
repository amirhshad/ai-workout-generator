# Architecture Overview

## System Components

### 1. User Interface (Frontend)
- React/Next.js web application
- User authentication and profile management
- Workout history visualization
- Workout plan request and viewing interface

### 2. API Server (Backend)
- Node.js/Express server
- Authentication and authorization
- API integrations for Claude and Hevy
- Data transformation and processing

### 3. External Services
- **Claude AI**: Generates personalized workout plans
- **Hevy API**: Provides workout tracking and history

### 4. Database
- MongoDB for storing:
  - User profiles and preferences
  - Workout history and performance metrics
  - Generated workout plans
  - Authentication tokens

## Data Flow

1. **User Authentication**
   - User logs in to the application
   - Application authenticates with both Claude and Hevy APIs

2. **Data Synchronization**
   - Application fetches workout history from Hevy
   - Performance metrics are processed and stored

3. **Workout Generation**
   - Application sends user data and preferences to Claude
   - Claude generates personalized workout plan
   - Application parses and processes the AI response

4. **Plan Integration**
   - Processed workout plan is sent to Hevy
   - Plan is stored in the application database
   - User is notified of the new workout plan

5. **Feedback Loop**
   - User completes workouts in Hevy
   - Performance data is synchronized back to the application
   - Data is used to inform future workout generation

## Authentication Flow

1. User registers/logs in to the application
2. Application generates JWT for internal authentication
3. User authorizes application to access Hevy account (OAuth)
4. Application stores and manages Hevy API tokens
5. Application uses API key for Claude AI access

## Scaling Considerations

- Separate API rate limiting for Claude and Hevy
- Caching strategy for frequently accessed data
- Database indexing for performance
- User data partitioning for multi-tenant scaling
