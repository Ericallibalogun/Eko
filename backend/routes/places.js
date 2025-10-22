import express from 'express';
import Place from '../models/Place.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Get places by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const places = await Place.find({ category });
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search places
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    
    const places = await Place.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });
    
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get place by ID
router.get('/:id', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }
    res.json(place);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new place (authenticated users only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, description, imageUrl, location } = req.body;
    
    const place = new Place({
      name,
      category,
      description,
      imageUrl,
      location,
      createdBy: req.user.userId
    });
    
    await place.save();
    res.status(201).json(place);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's saved places
router.get('/saved', authMiddleware, async (req, res) => {
  try {
    const places = await Place.find({ createdBy: req.user.userId });
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;