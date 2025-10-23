# Troubleshooting Guide: "Failed to Fetch" Error

## Problem Description

When running the backend locally and trying to register a user through the frontend, you receive a "failed to fetch" error.

## Root Causes and Solutions

### 1. CORS Configuration

**Issue**: Cross-Origin Resource Sharing restrictions prevent the frontend from communicating with the backend.

**Solution**: Already implemented in the backend with permissive CORS settings for local development:

```javascript
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

### 2. Port Conflicts

**Issue**: Another process is using port 3000 or 5000.

**Solution**:

1. Check which processes are using the ports:

   ```bash
   netstat -ano | findstr :3000
   netstat -ano | findstr :5000
   ```

2. Kill the conflicting processes:
   ```bash
   taskkill /PID <process_id> /F
   ```

### 3. Backend Not Running

**Issue**: The backend server is not started or crashed.

**Solution**:

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Start the backend server:

   ```bash
   npm run dev
   ```

3. Verify it's running on port 5000:
   ```
   Server is running on port 5000
   Connected to MongoDB
   ```

### 4. Frontend Not Running

**Issue**: The frontend development server is not started.

**Solution**:

1. Navigate to the root project directory:

   ```bash
   cd ..
   ```

2. Start the frontend server:

   ```bash
   npm run dev
   ```

3. Verify it's running on port 3000:
   ```
   ➜  Local:   http://localhost:3000/
   ```

### 5. API Endpoint URL Mismatch

**Issue**: The frontend is trying to connect to the wrong backend URL.

**Solution**: Verify the API base URL in [services/apiService.ts](file://c:\Users\DELL\Downloads\Eko\Eko\services\apiService.ts):

```typescript
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://eko-7.onrender.com/api" // Production backend URL
    : "http://localhost:5000/api"; // Local development
```

## Testing Steps

### 1. Verify Backend Health

```bash
curl http://localhost:5000/health
```

Expected response: `{"status":"OK","timestamp":"...","service":"EKO Navigation Backend","mongodb":"Connected"}`

### 2. Test Registration Endpoint

```bash
curl -Method POST -Uri http://localhost:5000/api/auth/register -ContentType "application/json" -Body '{"name":"Test User","email":"test3@example.com","password":"password123"}'
```

Expected response: Status 201 with user data and token

### 3. Check Browser Console

When using the frontend:

1. Open browser developer tools (F12)
2. Go to the Console tab
3. Look for any error messages
4. Check the Network tab for failed requests

## Common Error Messages and Solutions

### "Failed to fetch"

- **Cause**: Network connectivity issue between frontend and backend
- **Solution**: Ensure both servers are running and CORS is properly configured

### "CORS error"

- **Cause**: Browser security blocking cross-origin requests
- **Solution**: Backend CORS configuration already handles this

### "Network error"

- **Cause**: Backend server not reachable
- **Solution**: Verify backend is running on port 5000

## Current Status Verification

### Backend

✅ Running on port 5000
✅ Connected to MongoDB
✅ CORS configured for local development
✅ API endpoints accessible

### Frontend

✅ Running on port 3000
✅ Configured to connect to backend at http://localhost:5000/api

## Next Steps

1. Open your browser and navigate to http://localhost:3000
2. Try to register a new user
3. Check the browser console for any errors
4. If issues persist, check the Network tab in developer tools

The "failed to fetch" error should now be resolved with the updated CORS configuration and proper server setup.
