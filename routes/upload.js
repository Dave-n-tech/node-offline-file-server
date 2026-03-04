const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');


// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const randomName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, randomName);
  }
});

const upload = multer({ storage });
const METADATA_FILE = path.join(__dirname, '../uploads/.metadata.json');

// Upload page (protected)
router.get('/upload', (req, res) => {
  if (req.ip !== '::1' && req.ip !== '127.0.0.1') {
    return res.status(403).send('Forbidden');
  }
  res.render('upload');
});

// Upload POST
router.post('/upload', upload.array('files'), async (req, res) => {
  let metadata = {};
  try {
    if (await fs.pathExists(METADATA_FILE)) {
      metadata = await fs.readJson(METADATA_FILE);
    }
  } catch (err) {
    metadata = {};
  }

  // Map stored filenames to original names
  if (req.files) {
    for (const file of req.files) {
      metadata[file.filename] = file.originalname;
    }
    await fs.writeJson(METADATA_FILE, metadata);
  }

  res.render('upload-success', { 
    fileCount: req.files ? req.files.length : 0 
  });
});

module.exports = router;