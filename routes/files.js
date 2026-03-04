const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

const METADATA_FILE = path.join(__dirname, '../uploads/.metadata.json');

// File listing
router.get('/', async (req, res) => {
  const uploadDir = path.join(__dirname, '../uploads');
  let files = await fs.readdir(uploadDir);
  
  // Filter out metadata file
  files = files.filter(f => f !== '.metadata.json');

  // Read metadata to get original filenames
  let metadata = {};
  try {
    if (await fs.pathExists(METADATA_FILE)) {
      metadata = await fs.readJson(METADATA_FILE);
    }
  } catch (err) {
    // If metadata file is corrupted, continue with empty metadata
    console.warn('Could not read metadata:', err.message);
  }

  // Map stored filenames to display info
  const fileList = files.map(storedName => ({
    storedName,
    originalName: metadata[storedName] || storedName
  }));

  res.render('index', { files: fileList });
});

// Download streaming
router.get('/download/:filename', async (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');

  // Read metadata to get original filename
  let metadata = {};
  try {
    if (await fs.pathExists(METADATA_FILE)) {
      metadata = await fs.readJson(METADATA_FILE);
    }
  } catch (err) {
    // Continue if metadata can't be read
    console.warn('Could not read metadata:', err.message);
  }

  const originalName = metadata[req.params.filename] || req.params.filename;

  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': stat.size,
    'Content-Disposition': `attachment; filename="${originalName}"`
  });

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

module.exports = router;