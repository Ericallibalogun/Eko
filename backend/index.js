// Entry point for the application
console.log('Starting EKO Navigation Backend...');

// Import and start the server
import('./server.js').then(() => {
  console.log('Server started successfully');
}).catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});