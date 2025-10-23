# EKO Navigation Deployment Guide

This guide will help you deploy both the frontend and backend of the EKO Navigation application.

## Prerequisites

1. Node.js (version 16 or higher)
2. MongoDB Atlas account
3. Google Gemini API key
4. GitHub account
5. Render account (for backend deployment)
6. Netlify or Vercel account (for frontend deployment)

## Backend Deployment (Render - Recommended)

### 1. Prepare Your Environment Variables

Before deployment, you'll need to prepare these environment variables:

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secret key for JWT token signing
- `GEMINI_API_KEY`: Your Google Gemini API key
- `PORT`: Server port (Render will set this automatically)

### 2. Deploy to Render

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
   - JWT_SECRET: your JWT secret (generate a random string)
   - GEMINI_API_KEY: your Gemini API key
7. Click "Create Web Service"

### 3. Verify Deployment

After deployment completes, you can verify it's working by visiting:
`https://your-render-app-url.onrender.com/health`

You should see a JSON response with status "OK".

## Frontend Deployment (Netlify - Recommended)

### 1. Deploy to Netlify

1. Go to [Netlify](https://netlify.com/) and create an account
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure the deployment:
   - Branch: main
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables in the Netlify dashboard:
   - `VITE_GEMINI_API_KEY`: your Gemini API key
6. Click "Deploy site"

### 2. Update API URL

Since the frontend and backend are deployed separately, you'll need to update the API base URL in your frontend code.

In `services/apiService.ts`, modify the API_BASE_URL to point to your deployed backend:

```typescript
const API_BASE_URL = "https://your-render-backend-url.onrender.com/api";
```

Alternatively, you can use environment variables in Netlify:

- Add `VITE_API_URL` with your backend URL as the value
- Update the apiService.ts file to use:

```typescript
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
```

## Alternative: Single Deployment (Frontend Served by Backend)

If you prefer to serve the frontend through the backend (single deployment), follow these steps:

### 1. Build the Frontend

```bash
npm run build
```

### 2. Copy Build Files to Backend

Copy all files from the `dist` folder to the `backend/public` folder.

### 3. Deploy Only the Backend

Deploy just the backend to Render as described above. The backend will serve both the API and the frontend files.

## MongoDB Atlas Configuration

### 1. Create a Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Select the free tier (M0 Sandbox)

### 2. Configure Network Access

1. Go to "Network Access" in your MongoDB Atlas dashboard
2. Add your server's IP address (for Render, you can add `0.0.0.0/0` to allow all IPs, but this is less secure)
3. Or add specific IP addresses:
   - Render IPs: Check Render's documentation for their IP ranges

### 3. Create Database User

1. Go to "Database Access" in your MongoDB Atlas dashboard
2. Create a new database user with read/write permissions

### 4. Get Connection String

1. Go to "Clusters" in your MongoDB Atlas dashboard
2. Click "Connect"
3. Select "Connect your application"
4. Copy the connection string and replace `<password>` with your user's password

## Environment Variables Reference

### Backend (.env)

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your_random_jwt_secret_key
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=production
```

### Frontend (.env)

```
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your backend allows requests from your frontend origin
2. **MongoDB Connection**: Ensure your IP is whitelisted in MongoDB Atlas
3. **Environment Variables**: Double-check that all required environment variables are set
4. **API Key Issues**: Verify your Google Gemini API key is valid and has credits

### Checking Logs

- Render: View logs in the Render dashboard
- Netlify: View logs in the Netlify dashboard
- MongoDB Atlas: Check the monitoring section for connection issues

## Scaling Considerations

1. **Free Tier Limitations**:

   - Render free tier has sleep-after-inactivity policy
   - MongoDB Atlas free tier has storage and performance limits
   - Consider upgrading for production use

2. **Performance Optimization**:

   - Implement caching for frequently accessed data
   - Use indexes in MongoDB for better query performance
   - Optimize API responses to reduce payload size

3. **Security Best Practices**:
   - Use HTTPS in production
   - Rotate API keys regularly
   - Implement rate limiting
   - Validate and sanitize all inputs

## Support

If you encounter any issues during deployment, please check:

1. All environment variables are correctly set
2. Network access is properly configured
3. Dependencies are compatible with the deployment platform
4. The deployment platform's documentation for specific requirements
