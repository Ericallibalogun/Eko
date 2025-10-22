import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'eko_navigation_secret', {
    expiresIn: '7d'
  });
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      settings: user.settings,
      savedPlaces: user.savedPlaces,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      settings: user.settings,
      savedPlaces: user.savedPlaces,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Google login/signup
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    // In a real implementation, you would verify the Google token here
    // For now, we'll simulate a successful authentication
    
    // Mock user data - in reality, this would come from Google's verification
    const mockUserData = {
      name: 'Google User',
      email: 'google.user@example.com',
      avatarUrl: 'https://api.pravatar.cc/150?u=google.user@example.com'
    };

    // Check if user exists, if not create them
    let user = await User.findOne({ email: mockUserData.email });
    
    if (!user) {
      user = new User({
        name: mockUserData.name,
        email: mockUserData.email,
        password: 'google_auth_password', // This won't be used for Google auth
        avatarUrl: mockUserData.avatarUrl
      });
      await user.save();
    }

    // Generate our own JWT token
    const authToken = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      settings: user.settings,
      savedPlaces: user.savedPlaces,
      token: authToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;