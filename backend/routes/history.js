const express = require('express');
const router = express.Router();
const OutfitHistory = require('../models/OutfitHistory');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const history = await OutfitHistory.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await OutfitHistory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;