#!/bin/bash

# Deployment script for EKO Navigation application

echo "Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found. Please run this script from the project root directory."
  exit 1
fi

# Build the frontend
echo "Building frontend..."
npm run build

if [ $? -ne 0 ]; then
  echo "Error: Frontend build failed."
  exit 1
fi

echo "Frontend build completed successfully."

# Copy the built files to the backend public directory
echo "Copying frontend build to backend..."
cp -r dist/* backend/

echo "Frontend files copied to backend."

# Deploy to Render (requires Render CLI to be installed)
echo "To deploy to Render:"
echo "1. Make sure you have committed all changes to Git"
echo "2. Push to your GitHub repository"
echo "3. Connect your repository to Render"
echo "4. Set the environment variables in Render dashboard:"
echo "   - MONGODB_URI: your MongoDB Atlas connection string"
echo "   - JWT_SECRET: your JWT secret"
echo "   - GEMINI_API_KEY: your Gemini API key"

echo "Deployment preparation completed!"
echo "Next steps:"
echo "1. Commit and push your changes to GitHub"
echo "2. Deploy the backend to Render using the render.yaml configuration"
echo "3. For frontend deployment, you can use Netlify or Vercel"
echo "   - Point it to the root directory"
echo "   - Set the environment variable GEMINI_API_KEY in the dashboard"