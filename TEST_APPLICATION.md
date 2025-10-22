# EKO Navigation - Application Testing Guide

This guide provides step-by-step instructions to test that the EKO Navigation application is working correctly after the fixes.

## Prerequisites

1. MongoDB installed and running
2. Node.js installed
3. All dependencies installed (as per previous fixes)

## Testing Steps

### 1. Start the Backend Server

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm run dev
```

Expected output:

- Server should start on port 5000
- MongoDB connection should be established
- Console should show "Server is running on port 5000"

### 2. Start the Frontend Development Server

Open another terminal in the root directory:

```bash
npm run dev
```

Expected output:

- Vite development server should start
- Application should be available at http://localhost:5173
- No compilation errors should be shown

### 3. Test User Authentication

1. Open browser to http://localhost:5173
2. You should see the splash screen, then the login screen
3. Click "Sign up" to create a new account:
   - Enter name, email, and password
   - Click "Create Account"
   - You should be redirected to permissions screen, then home screen
4. Test logout:
   - Open sidebar menu
   - Go to Settings
   - Click "Logout" button
   - You should be redirected to login screen

### 4. Test User Login

1. On login screen, enter credentials used during signup
2. Click "Login"
3. You should be redirected to permissions screen, then home screen

### 5. Test Place Exploration

1. From home screen, click "Explore" in sidebar
2. Try different categories (Trending, Food, Culture, Nature, Events)
3. You should see places loaded from either:
   - Backend database (if data exists)
   - Gemini API (fallback if no backend data)

### 6. Test Chat Functionality

1. From home screen, click the chat icon to open EkoBot
2. Send a message like "Hello, what can you help me with?"
3. You should receive a response from the Gemini API
4. Close the chat and reopen it
5. Previous conversation should be loaded from backend

### 7. Test Settings Persistence

1. From home screen, click "Settings" in sidebar
2. Change any setting (theme, language, map source)
3. You should see a success message
4. Refresh the page
5. Settings should persist (loaded from backend)

### 8. Test Backend API Directly

You can also test the backend API directly using curl or Postman:

1. Test user registration:

   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

2. Test user login:

   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. Test places by category:
   ```bash
   curl http://localhost:5000/api/places/category/Nature
   ```

## Expected Results

After completing all tests, you should observe:

1. ✅ No TypeScript compilation errors
2. ✅ No runtime errors in browser console
3. ✅ User authentication works (registration, login, logout)
4. ✅ Place exploration works with proper data loading
5. ✅ Chat history persists between sessions
6. ✅ User settings persist between sessions
7. ✅ Backend API responds correctly to requests
8. ✅ Frontend and backend communicate properly

## Troubleshooting

If you encounter issues:

1. **MongoDB Connection Error**:

   - Ensure MongoDB is running
   - Check MONGODB_URI in backend/.env
   - Verify MongoDB is accessible on localhost:27017

2. **Port Conflicts**:

   - Change PORT in backend/.env
   - Update API_BASE_URL in services/apiService.ts if needed

3. **Authentication Issues**:

   - Check JWT_SECRET in backend/.env
   - Verify localStorage is working in browser

4. **API Connection Issues**:
   - Ensure backend server is running
   - Check API_BASE_URL in services/apiService.ts
   - Verify CORS configuration in backend/server.js

## Conclusion

If all tests pass, the EKO Navigation application is working correctly with:

- Proper frontend-backend integration
- User authentication and session management
- Persistent data storage (places, chat history, settings)
- Fallback mechanisms for external APIs
- Responsive UI with all original functionality preserved
