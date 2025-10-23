import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, avatarUrl } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    
    await user.save();
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      settings: user.settings,
      savedPlaces: user.savedPlaces
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user settings
router.put('/settings', authMiddleware, async (req, res) => {
  try {
    const { theme, language, mapSource } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update settings
    if (theme) user.settings.theme = theme;
    if (language) user.settings.language = language;
    if (mapSource) user.settings.mapSource = mapSource;
    
    await user.save();
    
    res.json(user.settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a saved place
router.post('/saved-places', authMiddleware, async (req, res) => {
  try {
    const { name, category, imageUrl } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add the new saved place
    const newPlace = { name, category, imageUrl };
    user.savedPlaces.push(newPlace);
    
    await user.save();
    
    res.json(user.savedPlaces);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove a saved place
router.delete('/saved-places/:placeId', authMiddleware, async (req, res) => {
  try {
    const { placeId } = req.params;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove the saved place by index (in a real app, you might use a more robust ID system)
    user.savedPlaces = user.savedPlaces.filter((_, index) => index.toString() !== placeId);
    
    await user.save();
    
    res.json(user.savedPlaces);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;