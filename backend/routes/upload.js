const express = require('express');
const router = express.Router();
const { upload, optimizeUrl } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Return both raw and optimized URLs
    const rawUrl = req.file.path;
    const optimizedUrl = optimizeUrl(rawUrl, {
      width: 500,
      height: 500,
      crop: 'limit',
      quality: 'auto',
      format: 'auto',
    });

    res.json({
      imageUrl: optimizedUrl,  // frontend uses this
      rawUrl,                  // kept for reference
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;