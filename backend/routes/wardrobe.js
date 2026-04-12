const express = require('express');
const router = express.Router();
const Wardrobe = require('../models/Wardrobe');
const { protect } = require('../middleware/auth');
const { invalidateWardrobe } = require('../middleware/cache');

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

    // Invalidate cache so next GET reflects new item
    const token = req.headers.authorization?.split(' ')[1];
    invalidateWardrobe(token);

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    // .lean() returns plain JS objects instead of Mongoose documents — faster reads
    const items = await Wardrobe.find({ user: req.user.id }).lean();
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

    // Invalidate cache so next GET reflects deletion
    const token = req.headers.authorization?.split(' ')[1];
    invalidateWardrobe(token);

    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;