const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const os = require("os")
const open = require("open").default;
const bonjour = require("bonjour")();
const fs = require("fs-extra");
const path = require("path");

const app = express();
const PORT = 8080;
let server;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

const connectRoute = require('./routes/connect');
const uploadRoute = require('./routes/upload');
const filesRoute = require('./routes/files');

app.use(connectRoute);
app.use(uploadRoute);
app.use(filesRoute);


// try {
//   bonjour.publish({ name: 'FileShare', type: 'http', port: PORT });
// } catch (err) {
//   console.warn('Could not publish mDNS service:', err.message);
// }


function cleanupSync() {
  try {
    console.log('\nCleaning up uploads folder...');
    const uploadsDir = path.join(__dirname, 'uploads');
    
    // Delete the entire uploads folder
    if (require('fs').existsSync(uploadsDir)) {
      require('fs').rmSync(uploadsDir, { recursive: true, force: true });
      console.log('Uploads folder deleted');
    }
    console.log('Cleanup complete');
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
}

let isShuttingDown = false;

process.on('SIGINT', () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log('\nShutting down server...');
  cleanupSync();
  if (server) server.close();
  setTimeout(() => process.exit(0), 100);
});

process.on('SIGTERM', () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log('\nShutting down server (SIGTERM)...');
  cleanupSync();
  if (server) server.close();
  setTimeout(() => process.exit(0), 100);
});

// Fallback cleanup handlers
process.on('beforeExit', (code) => {
  if (!isShuttingDown) {
    console.log('\nProcess beforeExit, cleaning up...');
    cleanupSync();
  }
});

process.on('exit', (code) => {
  if (!isShuttingDown) {
    // Synchronous cleanup only
    const uploadsDir = path.join(__dirname, 'uploads');
    if (require('fs').existsSync(uploadsDir)) {
      try {
        require('fs').rmSync(uploadsDir, { recursive: true, force: true });
        console.log('Exit cleanup: uploads folder deleted');
      } catch (err) {
        console.error('Exit cleanup error:', err.message);
      }
    }
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  cleanupSync();
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  cleanupSync();
  process.exit(1);
});

server = app.listen(PORT, "0.0.0.0", async () => {
  // Ensure uploads folder exists
  const uploadsDir = path.join(__dirname, 'uploads');
  await fs.ensureDir(uploadsDir);
  console.log('Uploads folder ready');

  console.log(`Server running at http://localhost:${PORT}`);

  const interfaces = os.networkInterfaces();
  for (let name of Object.keys(interfaces)) {
    for (let net of interfaces[name]) {
      if (net.family === "IPv4" && !net.internal) {
        console.log(`Access at: http://${net.address}:${PORT}`);
      }
    }
  }
  console.log(`Upload files at: http://localhost:${PORT}/upload`);

  await open(`http://localhost:${PORT}/connect`);
});