const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'outfit-ai',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' }, // max dimensions
      { quality: 'auto', fetch_format: 'auto' },  // auto compress + best format (webp/avif)
    ],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max upload size
});

// Helper — adds optimization params to any existing Cloudinary URL
const optimizeUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) return url;

  const {
    width = 400,
    height = 400,
    crop = 'limit',
    quality = 'auto',
    format = 'auto',
  } = options;

  const transformation = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;

  // Insert transformation before the version number or filename
  return url.replace('/upload/', `/upload/${transformation}/`);
};

module.exports = { cloudinary, upload, optimizeUrl };