import express from 'express';
import ChatSession from '../models/Chat.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Get chat history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const chatSession = await ChatSession.findOne({ userId: req.user.userId });
    
    if (!chatSession) {
      return res.json({ messages: [] });
    }
    
    res.json({ messages: chatSession.messages });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save a message
router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { role, text } = req.body;
    
    // Find or create chat session
    let chatSession = await ChatSession.findOne({ userId: req.user.userId });
    
    if (!chatSession) {
      chatSession = new ChatSession({
        userId: req.user.userId,
        messages: []
      });
    }
    
    // Add new message
    chatSession.messages.push({ role, text });
    
    // Keep only the last 50 messages to prevent excessive growth
    if (chatSession.messages.length > 50) {
      chatSession.messages = chatSession.messages.slice(-50);
    }
    
    await chatSession.save();
    
    res.json({ message: 'Message saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear chat history
router.delete('/history', authMiddleware, async (req, res) => {
  try {
    await ChatSession.deleteOne({ userId: req.user.userId });
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;