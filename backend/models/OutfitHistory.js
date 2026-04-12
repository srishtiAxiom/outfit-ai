const mongoose = require('mongoose');

const outfitHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  occasion: {
    type: String,
    required: true,
  },
  weather: {
    type: String,
    required: true,
  },
  temperature: {
    type: String,
    required: true,
  },
  recommendation: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Indexes for faster queries
outfitHistorySchema.index({ user: 1 });              // filter by user
outfitHistorySchema.index({ user: 1, createdAt: -1 }); // filter by user, latest first

module.exports = mongoose.model('OutfitHistory', outfitHistorySchema);