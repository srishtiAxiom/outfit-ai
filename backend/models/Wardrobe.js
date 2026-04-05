const mongoose = require('mongoose');

const wardrobeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['top', 'bottom', 'shoes', 'accessory', 'outerwear'],
  },
  color: {
    type: String,
    required: true,
  },
  occasion: {
    type: String,
    required: true,
    enum: ['casual', 'formal', 'party', 'sports', 'traditional'],
  },
  season: {
    type: String,
    required: true,
    enum: ['summer', 'winter', 'rainy', 'all'],
  },
  imageUrl: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Wardrobe', wardrobeSchema);