# EKO Navigation Backend

This is the backend for the EKO Navigation app, built with Node.js, Express, and MongoDB.

## Features

- User authentication (register, login, Google login)
- User profile management
- Settings management
- Saved places management
- Chat history storage
- Place discovery and search
- RESTful API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in the backend directory with the following variables:

   ```env
   MONGODB_URI=mongodb://localhost:27017/eko-navigation
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```

3. Start the MongoDB server:

   ```bash
   mongod
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google login

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/settings` - Update user settings
- `POST /api/users/saved-places` - Add a saved place
- `DELETE /api/users/saved-places/:placeId` - Remove a saved place

### Places

- `GET /api/places/category/:category` - Get places by category
- `GET /api/places/search?query=...` - Search places
- `GET /api/places/:id` - Get place by ID
- `POST /api/places` - Create a new place (authenticated)
- `GET /api/places/saved` - Get user's saved places (authenticated)

### Chat

- `GET /api/chat/history` - Get chat history
- `POST /api/chat/message` - Save a message
- `DELETE /api/chat/history` - Clear chat history

## Models

### User

- name (String)
- email (String, unique)
- password (String, hashed)
- avatarUrl (String)
- settings (Object)
  - theme (String: 'Dark', 'Light', 'Auto')
  - language (String: 'English', 'Yoruba', 'Hausa', 'Igbo')
  - mapSource (String: 'OpenStreetMap', 'Google Maps')
- savedPlaces (Array of Objects)
- createdAt (Date)

### Place

- name (String)
- category (String)
- description (String)
- imageUrl (String)
- location (Object with coordinates)
- createdBy (ObjectId, ref to User)
- isPublic (Boolean)
- timestamps (createdAt, updatedAt)

### ChatSession

- userId (ObjectId, ref to User)
- messages (Array of Objects)
  - role (String: 'user', 'model')
  - text (String)
  - timestamp (Date)
- createdAt (Date)
- updatedAt (Date)

## Integration with Frontend

The frontend communicates with the backend through the API service (`services/apiService.ts`). All API calls are handled through this service which includes proper error handling and authentication token management.

Authentication tokens are stored in localStorage and automatically included in authenticated requests.

## Development

To run the backend in development mode with auto-restart:

```bash
npm run dev
```

To run the backend in production mode:

```bash
npm start
```
