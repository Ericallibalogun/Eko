# EKO Navigation Backend

This is the backend API for the EKO Navigation application.

## Features

- User authentication (register, login, Google login)
- User profile management
- Saved places management
- Chat history management
- Place search and categorization

## Technologies Used

- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Google Gemini API integration

## Setup Instructions

### Local Development

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key
   ```
5. Start the development server:
   ```
   npm run dev
   ```

### Production Deployment

#### Option 1: Deploy to Render (Recommended - Free Tier Available)

1. Fork this repository to your GitHub account
2. Go to [Render](https://render.com/) and create an account
3. Click "New Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - Name: eko-navigation-backend
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Auto Deploy: Yes
6. Add environment variables in the Render dashboard:
   - MONGODB_URI: your MongoDB Atlas connection string
   - JWT_SECRET: your JWT secret
   - GEMINI_API_KEY: your Gemini API key
7. Click "Create Web Service"

#### Option 2: Deploy to Heroku

1. Install the Heroku CLI
2. Login to Heroku:
   ```
   heroku login
   ```
3. Create a new Heroku app:
   ```
   heroku create your-app-name
   ```
4. Set environment variables:
   ```
   heroku config:set MONGODB_URI=your_mongodb_connection_string
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set GEMINI_API_KEY=your_gemini_api_key
   ```
5. Deploy:
   ```
   git push heroku main
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
- `DELETE /api/users/saved-places/:id` - Remove a saved place

### Places

- `GET /api/places/category/:category` - Get places by category
- `GET /api/places/search?query=...` - Search places

### Chat

- `GET /api/chat/history` - Get chat history
- `POST /api/chat/message` - Save a message
- `DELETE /api/chat/history` - Clear chat history

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token signing
- `PORT` - Server port (default: 5000)
- `GEMINI_API_KEY` - Google Gemini API key

## Database Models

### User

- name: String
- email: String (unique)
- password: String (hashed)
- avatarUrl: String
- settings: Object (theme, language, mapSource)
- savedPlaces: Array of Objects
- chatHistory: Array of Objects

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit your changes
5. Push to the branch
6. Create a pull request
