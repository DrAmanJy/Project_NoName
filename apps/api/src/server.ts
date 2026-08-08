import { createServer } from 'node:http';
import { createApp } from './app.js';
import { logger } from './infrastructure/logger.js';

const PORT = Number(process.env['PORT']) || 3001;

const app = createApp();
const server = createServer(app);

server.listen(PORT, () => {
  logger.info({ port: PORT }, '🚀 API server running');
});

// Graceful shutdown
function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
