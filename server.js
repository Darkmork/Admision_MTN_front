/**
 * Simple static file server for Railway deployment
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4173;
const distPath = path.join(__dirname, 'dist');

// Serve static files from dist directory
app.use(express.static(distPath));

// Handle SPA routing - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frontend server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${distPath}`);
  console.log(`🌐 Ready at http://0.0.0.0:${PORT}`);
});
