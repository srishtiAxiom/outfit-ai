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
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'unspecified'],
    default: 'unspecified',
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


module.exports = mongoose.model('User', userSchema);