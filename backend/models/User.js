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
    index: true,        // ← explicit index, guarantees Atlas creates it on M0
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

}, {
  timestamps: true,
  autoIndex: true,      // ← ensures indexes are built on app start (safe for M0)
});

// Indexes for faster queries
userSchema.index({ email: 1 }, { unique: true }); // ← explicit compound definition, belt-and-suspenders

module.exports = mongoose.model('User', userSchema);