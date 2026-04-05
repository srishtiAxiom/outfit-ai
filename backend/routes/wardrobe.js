const express = require('express');
const router = express.Router();
const Wardrobe = require('../models/Wardrobe');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { name, category, color, occasion, season, imageUrl } = req.body;

    const item = await Wardrobe.create({
      user: req.user.id,
      name,
      category,
      color,
      occasion,
      season,
      imageUrl,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const items = await Wardrobe.find({ user: req.user.id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Wardrobe.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await item.deleteOne();
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;