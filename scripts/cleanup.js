#!/usr/bin/env node
const fs = require("fs-extra");
const path = require("path");

async function cleanup() {
  try {
    console.log('\nCleaning up uploads folder...');
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (await fs.pathExists(uploadsDir)) {
      await fs.remove(uploadsDir);
      console.log('Uploads folder deleted');
    }
    console.log('Cleanup complete');
  } catch (err) {
    console.error('Cleanup error:', err);
  }
}

cleanup().then(() => process.exit(0));
