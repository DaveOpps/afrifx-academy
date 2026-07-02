import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import app from './app.js';

// Persistent-server entry point (used by Render and local `npm run dev`).
// On Vercel the app is served by api/[...path].js instead, and static files
// are served by Vercel's CDN — so this file is not used there.
const __dirname = dirname(fileURLToPath(import.meta.url));

// Serve the built React app (single-service deploy on Render/local).
const clientDist = join(__dirname, '../../client/dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(join(clientDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`AfriFX API running on http://localhost:${PORT}`));
