const express = require('express');
const router = express.Router();
const Wardrobe = require('../models/Wardrobe');
const { protect } = require('../middleware/auth');
const { invalidateWardrobeFromReq } = require('../middleware/cache');

// POST /api/wardrobe — add item
router.post('/', protect, async (req, res) => {
  try {
    const { name, category, color, occasion, season, imageUrl } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, error: 'name and category are required' });
    }

    const item = await Wardrobe.create({
      user: req.user.id,
      name: name.trim(),
      category,
      color,
      occasion,
      season,
      imageUrl,
    });

    invalidateWardrobeFromReq(req);

    res.status(201).json({ success: true, item });
  } catch (err) {
    console.error('[wardrobe POST]', err);
    res.status(500).json({ success: false, error: 'Failed to add item' });
  }
});

// GET /api/wardrobe — fetch all items for user
router.get('/', protect, async (req, res) => {
  try {
    const items = await Wardrobe.find({ user: req.user.id })
      .lean()
      .limit(200); // guard against unbounded queries

    res.json(items); // array returned directly — cache middleware expects bare array
  } catch (err) {
    console.error('[wardrobe GET]', err);
    res.status(500).json({ success: false, error: 'Failed to fetch wardrobe' });
  }
});

// DELETE /api/wardrobe/:id — remove item
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Wardrobe.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this item' });
    }

    await item.deleteOne();
    invalidateWardrobeFromReq(req);

    res.json({ success: true, message: 'Item removed' });
  } catch (err) {
    console.error('[wardrobe DELETE]', err);
    res.status(500).json({ success: false, error: 'Failed to delete item' });
  }
});

module.exports = router;