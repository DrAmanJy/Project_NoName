import type { Request, Response, NextFunction } from 'express';
import { logger } from '../infrastructure/logger.js';

interface AppError extends Error {
  status?: number;
  statusCode?: number;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status ?? err.statusCode ?? 500;

  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        status,
      },
    },
    'Unhandled error',
  );

  res.status(status).json({
    error: {
      message: status === 500 ? 'Internal Server Error' : err.message,
      status,
    },
  });
}
