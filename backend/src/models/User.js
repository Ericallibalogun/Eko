import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  settings: {
    theme: {
      type: String,
      enum: ['Dark', 'Light', 'Auto'],
      default: 'Dark'
    },
    language: {
      type: String,
      enum: ['English', 'Yoruba', 'Hausa', 'Igbo'],
      default: 'English'
    },
    mapSource: {
      type: String,
      enum: ['OpenStreetMap', 'Google Maps'],
      default: 'OpenStreetMap'
    }
  },
  savedPlaces: [{
    name: String,
    category: String,
    imageUrl: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;