# EKO Navigation - Complete Setup Instructions

This document provides complete instructions for setting up and running both the frontend and backend of the EKO Navigation application.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (v14 or higher)
- npm (comes with Node.js)
- MongoDB (v4.4 or higher)
- Git (optional, for version control)

## Backend Setup

### 1. Install MongoDB

#### Windows:

1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and follow the installation wizard
3. Choose "Complete" setup type
4. Choose "Run service as Network Service user"
5. Choose the default data directory or specify your own
6. Complete the installation

#### macOS:

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
```

#### Linux (Ubuntu):

```bash
# Import the public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create a list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org
```

### 2. Start MongoDB

#### Windows:

MongoDB service should start automatically after installation. If not:

1. Open Services (services.msc)
2. Find "MongoDB Server"
3. Right-click and select "Start"

Or from Command Prompt:

```cmd
net start MongoDB
```

#### macOS:

```bash
brew services start mongodb-community
```

#### Linux:

```bash
sudo systemctl start mongod
```

### 3. Install Backend Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/eko-navigation
JWT_SECRET=eko_navigation_jwt_secret_2025
PORT=5000
```

### 5. Initialize Database (Optional)

To populate the database with sample places:

```bash
npm run init-db
```

### 6. Start Backend Server

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

The backend server will start on http://localhost:5000

## Frontend Setup

### 1. Install Frontend Dependencies

From the root directory, install dependencies:

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Start Frontend Development Server

```bash
npm run dev
```

The frontend will start on http://localhost:5173

## Running Both Frontend and Backend

To run both the frontend and backend simultaneously:

1. Start the backend server in one terminal:

   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server in another terminal:
   ```bash
   npm run dev
   ```

## Project Structure

```
.
├── backend/                 # Backend application
│   ├── middleware/          # Express middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── scripts/             # Utility scripts
│   ├── .env                 # Backend environment variables
│   ├── package.json         # Backend dependencies
│   ├── server.js            # Main server file
│   └── README.md            # Backend documentation
├── components/              # React components
├── i18n/                    # Internationalization
├── services/                # Service files (API, Gemini)
├── .env.local               # Frontend environment variables
├── App.tsx                  # Main App component
├── README.md                # Project documentation
├── SETUP_INSTRUCTIONS.md    # This file
├── DEVELOPMENT_SUMMARY.md   # Implementation summary
├── package.json             # Frontend dependencies
└── vite.config.ts           # Vite configuration
```

## API Integration

The frontend communicates with the backend through the API service layer (`services/apiService.ts`). All authenticated requests automatically include the JWT token stored in localStorage.

### Authentication Flow

1. User registers or logs in through the frontend
2. Backend validates credentials and returns a JWT token
3. Frontend stores the token in localStorage
4. All subsequent requests include the token in the Authorization header
5. Backend middleware validates the token for protected routes

## Environment Variables

### Frontend (.env.local)

- `GEMINI_API_KEY`: Your Gemini API key for AI features

### Backend (.env)

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `PORT`: Port for the backend server

## Testing the Application

### Backend API Testing

```bash
cd backend
npm run test-api
```

### Manual Testing

1. Open http://localhost:5173 in your browser
2. Register a new user or log in with existing credentials
3. Navigate through the app features:
   - Explore places by category
   - Chat with EkoBot
   - Save favorite places
   - Update settings
4. Check that data persists between sessions

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check the MONGODB_URI in `.env`
   - Verify MongoDB is accessible on the specified port

2. **Port Conflicts**

   - Change the PORT variable in backend `.env`
   - Update API calls in frontend if backend port changes

3. **CORS Errors**

   - Ensure backend CORS configuration allows requests from frontend origin
   - Default configuration should work for development

4. **JWT Token Issues**
   - Ensure JWT_SECRET is set in backend `.env`
   - Check that tokens are properly stored in localStorage

### Logs and Debugging

- Backend logs are output to the terminal
- Frontend logs can be viewed in browser developer tools
- Check network tab for API request/response details

## Development Notes

### Adding New Features

1. **Backend**

   - Add new models in `backend/models/`
   - Create new routes in `backend/routes/`
   - Update `backend/server.js` to include new routes

2. **Frontend**
   - Create new components in `components/`
   - Add new API functions in `services/apiService.ts`
   - Update `App.tsx` to include new screens

### Security Considerations

- Never commit sensitive information (API keys, secrets) to version control
- Use environment variables for configuration
- Validate all user inputs
- Implement proper authentication and authorization
- Keep dependencies updated

## Deployment

For production deployment:

1. Set proper environment variables
2. Use a production MongoDB instance (MongoDB Atlas, etc.)
3. Configure proper CORS settings
4. Use a process manager like PM2 for the backend
5. Consider using a reverse proxy (nginx) for serving both frontend and backend
6. Set up SSL/HTTPS

## Support

For issues with this setup, please check:

1. All prerequisites are installed and running
2. Environment variables are properly configured
3. Network connectivity for API services
4. Console logs for error messages

If you continue to experience issues, please provide:

1. Error messages from console logs
2. Steps to reproduce the issue
3. Environment details (OS, Node.js version, etc.)
