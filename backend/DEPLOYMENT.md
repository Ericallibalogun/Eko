# Deployment Guide for EKO Navigation Backend

## Prerequisites

1. A GitHub account
2. A Render account (free tier available)
3. MongoDB Atlas account
4. Google Gemini API key

## Step-by-Step Deployment to Render

### 1. Fork the Repository

1. Go to your GitHub repository
2. Click the "Fork" button to create a copy of the repository under your account

### 2. Create a MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (M0 Sandbox is free)
3. Create a database user with read/write permissions
4. Whitelist your IP address (for Render, you can add `0.0.0.0/0` to allow all IPs, but this is less secure)
5. Get your connection string:
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password

### 3. Get Your Google Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Create an API key
3. Save this key for later use

### 4. Deploy to Render

1. Go to [Render](https://render.com/) and create an account
2. Click "New Web Service"
3. Connect your GitHub account
4. Select your forked repository
5. Configure the service:
   - **Name**: eko-navigation-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Auto Deploy**: Yes (recommended)
6. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A random string for JWT signing (32+ characters recommended)
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `NODE_ENV`: production
7. Click "Create Web Service"

### 5. Verify Deployment

1. Wait for the build to complete (this may take a few minutes)
2. Once deployed, you can test the health endpoint:
   ```
   curl https://your-render-app-url.onrender.com/health
   ```
3. You should receive a JSON response with status "OK"

## Environment Variables

Make sure to set these environment variables in your Render dashboard:

| Variable         | Description                     | Example                                              |
| ---------------- | ------------------------------- | ---------------------------------------------------- |
| `MONGODB_URI`    | MongoDB Atlas connection string | `mongodb+srv://user:password@cluster.mongodb.net/db` |
| `JWT_SECRET`     | Secret for JWT token signing    | `your_random_jwt_secret_key`                         |
| `GEMINI_API_KEY` | Google Gemini API key           | `AIzaSyDO7vp3wtJIsnhhn3ENDNJeo5XqW9MQGRs`            |
| `NODE_ENV`       | Environment mode                | `production`                                         |

## Troubleshooting

### Common Issues

1. **Application crashes on startup**:

   - Check that all environment variables are set correctly
   - Verify MongoDB connection string
   - Ensure IP is whitelisted in MongoDB Atlas

2. **Health check fails**:

   - Check Render logs for error messages
   - Verify the application is binding to the correct port

3. **Database connection issues**:
   - Double-check MongoDB connection string
   - Ensure database user has proper permissions
   - Verify IP whitelist in MongoDB Atlas

### Checking Logs

1. Go to your Render dashboard
2. Click on your web service
3. Click "Logs" to view real-time logs
4. Look for error messages or connection issues

## Scaling Considerations

1. **Free Tier Limitations**:

   - Render free tier has sleep-after-inactivity policy
   - First request after inactivity may be slow
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
