#!/usr/bin/env node

// Main entry point for the EKO Navigation Backend
console.log('Starting EKO Navigation Backend...');

// Import the server
import('./server-simple.js').then(() => {
  console.log('Server started successfully');
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});