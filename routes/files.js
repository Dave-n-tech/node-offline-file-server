const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const fileEvents = require('../utils/eventEmitter');

const METADATA_FILE = path.join(__dirname, '../uploads/.metadata.json');

// SSE clients
const clients = new Set();

fileEvents.on('new-file', (fileData) => {
  const payload = `data: ${JSON.stringify(fileData)}\n\n`;
  for (const client of clients) {
    client.write(payload);
  }
});

// File listing
router.get('/', async (req, res) => {
  const uploadDir = path.join(__dirname, '../uploads');
  let files = [];
  try {
    if (await fs.pathExists(uploadDir)) {
      files = await fs.readdir(uploadDir);
    }
  } catch (err) {
    console.warn('Could not read upload directory:', err.message);
  }
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

// SSE endpoint for real-time file updates
router.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });
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