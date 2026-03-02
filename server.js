const express = require("express");
const multer = require("multer");
const os = require("os");
const open = require("open").default;

const app = express();
const PORT = 8000;

// Store file in memory (no disk saving)
const upload = multer({ storage: multer.memoryStorage() });

let uploadedFile = null;

app.get("/", (req, res) => {
  if (!uploadedFile) {
    return res.send("<h2>No file uploaded yet.</h2>");
  }

  res.send(`
    <h1>Download Class Material</h1>
    <p>${uploadedFile.originalname}</p>
    <a href="/download">Click here to download</a>
  `);
});

app.get("/admin", (req, res) => {
  res.send(`
    <h1>Upload Class File</h1>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="file" required />
      <button type="submit">Upload</button>
    </form>
  `);
});

// Handle upload
app.post("/upload", upload.single("file"), (req, res) => {
  uploadedFile = req.file;

  if (!uploadedFile) {
    return res.send("No file uploaded.");
  }

  res.send(`
    <h1>File Ready</h1>
    <p>${uploadedFile.originalname}</p>
    <p>Students can download at:</p>
    <a href="/download">Download Link</a>
  `);
});

// Download route
app.get("/download", (req, res) => {
  if (!uploadedFile) {
    return res.send("No file available.");
  }

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${uploadedFile.originalname}"`
  );
  res.send(uploadedFile.buffer);
});

// Start server
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);

  const interfaces = os.networkInterfaces();
  for (let name of Object.keys(interfaces)) {
    for (let net of interfaces[name]) {
      if (net.family === "IPv4" && !net.internal) {
        console.log(`Access at: http://${net.address}:${PORT}`);
      }
    }
  }

  // Open browser automatically
  await open(`http://localhost:${PORT}`);
});