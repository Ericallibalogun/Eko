// Startup script to verify environment and dependencies
console.log('Starting EKO Navigation Backend...');
console.log('Node.js version:', process.version);
console.log('Current working directory:', process.cwd());

// Check if required environment variables are set
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn('Warning: Missing environment variables:', missingEnvVars);
} else {
  console.log('All required environment variables are set');
}

// Try to import dependencies
try {
  import('express').then(() => console.log('Express imported successfully'));
  import('mongoose').then(() => console.log('Mongoose imported successfully'));
  import('cors').then(() => console.log('Cors imported successfully'));
  import('bcryptjs').then(() => console.log('Bcryptjs imported successfully'));
  import('jsonwebtoken').then(() => console.log('Jsonwebtoken imported successfully'));
  console.log('All dependencies imported successfully');
} catch (error) {
  console.error('Error importing dependencies:', error);
}

// Start the actual server
import('./server.js').then(() => {
  console.log('Server started successfully');
}).catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});