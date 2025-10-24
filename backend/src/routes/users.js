import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Add CORS headers to all responses from this router
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl,
      settings: req.user.settings,
      savedPlaces: req.user.savedPlaces
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, avatarUrl } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields
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
router.put('/settings', auth, async (req, res) => {
  try {
    const { theme, language, mapSource } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update settings
    if (theme !== undefined) user.settings.theme = theme;
    if (language !== undefined) user.settings.language = language;
    if (mapSource !== undefined) user.settings.mapSource = mapSource;
    
    await user.save();
    
    res.json(user.settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a saved place
router.post('/saved-places', auth, async (req, res) => {
  try {
    const { name, category, imageUrl } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add new saved place
    const newPlace = { name, category, imageUrl };
    user.savedPlaces.push(newPlace);
    
    await user.save();
    
    res.status(201).json(newPlace);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove a saved place
router.delete('/saved-places/:placeId', auth, async (req, res) => {
  try {
    const { placeId } = req.params;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove saved place by filtering out the place with the matching ID
    // We need to convert the ObjectId to string for comparison
    user.savedPlaces = user.savedPlaces.filter(place => 
      place._id ? place._id.toString() !== placeId : true
    );
    
    await user.save();
    
    res.json({ message: 'Place removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;