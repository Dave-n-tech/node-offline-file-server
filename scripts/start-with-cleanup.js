#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

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
    console.error('Cleanup error:', err.message);
  }
}

const nodemonPath = require.resolve('nodemon/bin/nodemon.js');
const nodemon = spawn(process.execPath, [nodemonPath, 'server.js'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

let cleaning = false;

async function handleExit(signal) {
  if (cleaning) return;
  cleaning = true;
  
  console.log(`\nReceived ${signal || 'exit signal'}`);
  nodemon.kill('SIGTERM');
  
  await new Promise(resolve => setTimeout(resolve, 100));
  await cleanup();
  process.exit(0);
}

process.on('SIGINT', () => handleExit('SIGINT'));
process.on('SIGTERM', () => handleExit('SIGTERM'));

nodemon.on('exit', async (code) => {
  if (!cleaning) {
    await cleanup();
    process.exit(code || 0);
  }
});
