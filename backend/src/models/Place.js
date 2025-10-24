import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Nature', 'Culture', 'Landmark', 'Food', 'Shopping', 'Entertainment']
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  imageUrl: {
    type: String,
    required: true
  },
  address: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  }
}, {
  timestamps: true
});

const Place = mongoose.model('Place', placeSchema);

export default Place;