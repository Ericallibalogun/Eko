import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Place from '../models/Place.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eko-navigation')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample places data for Lagos, Nigeria
const samplePlaces = [
  {
    name: 'Lekki Conservation Centre',
    category: 'Nature',
    description: 'A serene nature reserve known for its long canopy walkway and diverse wildlife.',
    imageUrl: 'https://images.unsplash.com/photo-160530514b219-c53351a8a25a?q=80&w=870&auto=format&fit=crop',
  },
  {
    name: 'Nike Art Gallery',
    category: 'Culture',
    description: 'A stunning art gallery showcasing contemporary and traditional Nigerian art.',
    imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=774&auto=format&fit=crop',
  },
  {
    name: 'Freedom Park Lagos',
    category: 'Landmark',
    description: 'A vibrant cultural center built on the site of a former colonial prison.',
    imageUrl: 'https://images.unsplash.com/photo-1568899347948-527b4b1b38f3?q=80&w=774&auto=format&fit=crop',
  },
  {
    name: 'Tarkwa Bay Beach',
    category: 'Nature',
    description: 'A peaceful beach destination accessible by boat, perfect for relaxation.',
    imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=774&auto=format&fit=crop',
  },
  {
    name: 'Kalakuta Republic Museum',
    category: 'Culture',
    description: 'A museum dedicated to the life and music of Fela Kuti, located in his former home.',
    imageUrl: 'https://images.unsplash.com/photo-1555529124-76251b6a186a?q=80&w=870&auto=format&fit=crop',
  },
  {
    name: 'Elegushi Beach',
    category: 'Nature',
    description: 'A popular beach with golden sand and clear waters, great for swimming and relaxation.',
    imageUrl: 'https://images.unsplash.com/photo-1505228395891-9a51e781709d?q=80&w=870&auto=format&fit=crop',
  },
  {
    name: 'National Museum Lagos',
    category: 'Culture',
    description: 'A museum showcasing Nigerian art, archaeology, and ethnography.',
    imageUrl: 'https://images.unsplash.com/photo-1597992838779-02b320e0c79d?q=80&w=870&auto=format&fit=crop',
  },
  {
    name: 'Lagos Lagoon',
    category: 'Nature',
    description: 'A large lagoon system offering boat tours and fishing opportunities.',
    imageUrl: 'https://images.unsplash.com/photo-1599058356052-73a3f509b9b1?q=80&w=870&auto=format&fit=crop',
  }
];

const initDB = async () => {
  try {
    // Clear existing places
    await Place.deleteMany({});
    console.log('Cleared existing places');

    // Insert sample places
    await Place.insertMany(samplePlaces);
    console.log('Sample places inserted successfully');

    // Close connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error initializing database:', error);
    mongoose.connection.close();
  }
};

// Run the initialization
initDB();