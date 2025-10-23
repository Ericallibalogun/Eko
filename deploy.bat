@echo off
REM Deployment script for EKO Navigation application

echo Starting deployment process...

REM Check if we're in the right directory
if not exist "package.json" (
  echo Error: package.json not found. Please run this script from the project root directory.
  exit /b 1
)

REM Build the frontend
echo Building frontend...
npm run build

if %errorlevel% neq 0 (
  echo Error: Frontend build failed.
  exit /b 1
)

echo Frontend build completed successfully.

REM Copy the built files to the backend public directory
echo Copying frontend build to backend...
xcopy dist backend /E /I /Y

echo Frontend files copied to backend.

echo Deployment preparation completed!
echo Next steps:
echo 1. Commit and push your changes to GitHub
echo 2. Deploy the backend to Render using the render.yaml configuration
echo 3. For frontend deployment, you can use Netlify or Vercel
echo    - Point it to the root directory
echo    - Set the environment variable GEMINI_API_KEY in the dashboard