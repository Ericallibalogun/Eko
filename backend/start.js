#!/usr/bin/env node

// Simple start script for EKO Navigation Backend
console.log('Starting EKO Navigation Backend...');

// Import and start the server
import('./index.js').then(() => {
  console.log('Server started successfully');
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});