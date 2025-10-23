#!/bin/bash

# Test Frontend Build Script

echo "Testing EKO Navigation Frontend Build..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found. Please run this script from the project root directory."
  exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the frontend
echo "Building frontend..."
npm run build

if [ $? -ne 0 ]; then
  echo "Error: Frontend build failed."
  exit 1
fi

echo "Frontend build completed successfully."

# Test the built files
if [ -d "dist" ]; then
  echo "Build output directory 'dist' exists with the following files:"
  ls -la dist/
else
  echo "Error: Build output directory 'dist' not found."
  exit 1
fi

echo "Frontend build test completed successfully!"
echo "You can now deploy the 'dist' directory to your preferred hosting service."