import express from 'express';
import Place from '../models/Place.js';

const router = express.Router();

// Add CORS headers to all responses from this router
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

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
    const places = await Place.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
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
    const { id } = req.params;
    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }
    res.json(place);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;