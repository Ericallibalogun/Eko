import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.chatHistory || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save a message
router.post('/message', auth, async (req, res) => {
  try {
    const { role, text } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add new message to chat history
    const newMessage = { role, text };
    user.chatHistory.push(newMessage);
    
    // Keep only the last 50 messages
    if (user.chatHistory.length > 50) {
      user.chatHistory = user.chatHistory.slice(-50);
    }
    
    await user.save();
    
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear chat history
router.delete('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.chatHistory = [];
    await user.save();
    
    res.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;