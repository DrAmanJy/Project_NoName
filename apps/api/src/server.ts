import { createServer } from 'node:http';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { createApp } from './app.js';
import { logger } from './infrastructure/logger.js';

const PORT = Number(process.env['PORT']) || 3001;

const app = createApp();
const server = createServer(app);

async function startServer() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    server.listen(PORT, () => {
      logger.info({ port: PORT }, 'API server running');
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down...');
  server.close(async () => {
    logger.info('Server closed');
    try {
      await mongoose.disconnect();
    } catch (err) {
      logger.error(err, 'Failed to disconnect from MongoDB');
      process.exit(1);
    }
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
