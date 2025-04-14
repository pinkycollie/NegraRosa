import { createServer } from 'http';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { registerRoutes } from '../server/routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Setup Express routes from the main server
const setupServer = async () => {
  try {
    // Register all API routes
    const server = await registerRoutes(app);

    // Static files from the client build
    app.use(express.static(resolve(__dirname, '../client/dist')));

    // Handle client-side routing
    app.get('*', (req, res) => {
      res.sendFile(resolve(__dirname, '../client/dist/index.html'));
    });

    return server;
  } catch (error) {
    console.error('Error setting up server:', error);
    throw error;
  }
};

// Create and start the server
let server;
setupServer()
  .then((httpServer) => {
    server = httpServer;
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

// Handle graceful shutdown
const shutdown = () => {
  if (server) {
    server.close(() => {
      console.log('Server shut down gracefully');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;