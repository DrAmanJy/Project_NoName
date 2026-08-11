import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { logger } from './infrastructure/logger.js';
import { healthRouter } from './routes/health.js';
import { notFoundHandler } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { videoRoutes } from './modules/video/video.routes.js';

export function createApp() {
  const app = express();

  // Trust the reverse proxy (e.g., Nginx, Cloudflare) for secure cookies and rate limiting
  app.set('trust proxy', 1);

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
      credentials: true,
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Logging
  app.use(pinoHttp({ logger }));

  // Routes
  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/videos', videoRoutes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
