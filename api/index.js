import express from 'express';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { registerRoutes } from '../server/routes.js';

// Initialize Express
const app = express();

// Standard Express middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS headers for Vercel environment
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Setup all routes
const setup = async () => {
  try {
    // Register all API routes from server/routes.js
    await registerRoutes(app);
    
    // For Vercel serverless functions, we don't need to create a server
    // The API is handled by Vercel's serverless infrastructure
    console.log('API routes registered successfully');
    
    return app;
  } catch (error) {
    console.error('Error setting up API routes:', error);
    throw error;
  }
};

// For local development, we need a listening server
if (process.env.NODE_ENV !== 'production') {
  setup().then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Development server running on port ${port}`);
    });
  });
}

// Export the Express application for Vercel
export default setup();