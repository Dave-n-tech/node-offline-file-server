const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const i of iface) {
      if (i.family === 'IPv4' && !i.internal) return i.address;
    }
  }
  return '127.0.0.1';
}

router.get('/connect', async (req, res) => {
  const LAN_IP = getLocalIP();
  const url = `http://${LAN_IP}:8080/`;
  const qrDataURL = await QRCode.toDataURL(url);
  res.render('connect', { qrDataURL, LAN_IP, mdnsName: 'fileshare.local' });
});

module.exports = router;