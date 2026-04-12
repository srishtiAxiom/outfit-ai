const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  bodyType: {
    type: String,
    default: '',
  },
  skinTone: {
    type: String,
    default: '',
  },
  preferredStyle: {
    type: String,
    default: '',
  },
  measurements: {
    height: { type: String, default: '' },
    weight: { type: String, default: '' },
    chest:  { type: String, default: '' },
    waist:  { type: String, default: '' },
    hips:   { type: String, default: '' },
  },
  avatarUrl: { type: String, default: '' },

}, { timestamps: true });

// Indexes for faster queries
userSchema.index({ email: 1 });  // fast login lookup (unique already, this makes it explicit)

module.exports = mongoose.model('User', userSchema);