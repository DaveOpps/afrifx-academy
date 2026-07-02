// Vercel serverless entry — routes every /api/* request into the Express app.
// (An Express app is itself a (req, res) handler, which is what Vercel expects.)
import app from '../server/src/app.js';

export default app;
