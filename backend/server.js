#!/usr/bin/env node

// Direct server entry point for deployment
// This file combines the functionality of index.js and server-simple.js
// to avoid module resolution issues in deployment environments

console.log('Starting EKO Navigation Backend...');

// Import required modules
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eko-navigation')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import placeRoutes from './routes/places.js';
import chatRoutes from './routes/chat.js';

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'EKO Navigation Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'EKO Navigation Backend',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/chat', chatRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

console.log('Server started successfully');