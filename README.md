# FIleShare: A Simple Express Offline File Server

A lightweight local file sharing server for quickly sharing files across devices on the same network.

## Features

- 📁 Upload multiple files from localhost
- 📥 Download files from any device on the network
- 🔄 Auto-cleanup: uploads folder is deleted when server stops
- 🎨 Clean, responsive UI with Tailwind CSS
- 🔒 Upload restricted to localhost only
- 🌐 Displays all network addresses for easy access

## Prerequisites

- Node.js (v16 or higher)
- npm

## Installation

```bash
npm install
```

## Usage

### Start the Server

```bash
npm start
```

The server will:
- Start on port `8080`
- Automatically open your browser to the connect page
- Display all available network URLs in the console
- Create an `uploads/` folder for temporary file storage

### Upload Files

1. Navigate to `http://localhost:8080/upload` (only accessible from localhost)
2. Select one or multiple files
3. Click "Upload"
4. Files will be available for download on the home page

### Download Files

Any device on the same network can:
1. Navigate to `http://<your-ip>:8080`
2. See all uploaded files with their original names
3. Click "Download" to download any file

### Stop the Server

Press `Ctrl+C` to stop the server. The uploads folder and all files will be automatically deleted.

## Project Structure

```
offline_file_server/
├── public/           # Static assets (CSS)
├── routes/           # Express route handlers
│   ├── connect.js    # Connection page
│   ├── files.js      # File listing and downloads
│   └── upload.js     # File upload handling
├── scripts/          # Utility scripts
├── views/            # EJS templates
├── uploads/          # Temporary file storage (auto-created/deleted)
├── server.js         # Main server file
└── package.json
```

## Configuration

- **Port**: Edit `PORT` in `server.js` (default: 8080)
- **Upload Route Protection**: Currently restricted to localhost only (see `routes/upload.js`)

## Tech Stack

- **Backend**: Express.js, Node.js
- **File Upload**: Multer
- **Template Engine**: EJS
- **Styling**: Tailwind CSS
- **Dev Tools**: Nodemon, Concurrently

## Notes

- Files are stored with unique filenames but displayed with their original names
- Metadata about original filenames is stored in `.metadata.json`
- All uploads are temporary and automatically deleted when the server stops
- The uploads folder is recreated each time the server starts

## License

ISC
