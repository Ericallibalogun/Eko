@echo off
REM Test Frontend Build Script

echo Testing EKO Navigation Frontend Build...

REM Check if we're in the right directory
if not exist "package.json" (
  echo Error: package.json not found. Please run this script from the project root directory.
  exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
  echo Installing dependencies...
  npm install
)

REM Build the frontend
echo Building frontend...
npm run build

if %errorlevel% neq 0 (
  echo Error: Frontend build failed.
  exit /b 1
)

echo Frontend build completed successfully.

REM Test the built files
if exist "dist" (
  echo Build output directory 'dist' exists with the following files:
  dir dist
) else (
  echo Error: Build output directory 'dist' not found.
  exit /b 1
)

echo Frontend build test completed successfully!
echo You can now deploy the 'dist' directory to your preferred hosting service.