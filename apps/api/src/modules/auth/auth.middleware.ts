import type { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env.js';
import { sessionService } from './session/session.service.js';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
      };
      authError?: string;
    }
  }
}

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let sessionToken = req.cookies[env.AUTH_COOKIE_NAME];

    if (!sessionToken && req.headers.authorization?.startsWith('Bearer ')) {
      sessionToken = req.headers.authorization.substring(7);
    }

    if (!sessionToken) {
      req.authError = 'Missing session token';
      return next();
    }

    const validatedSession = await sessionService.validateSession(sessionToken);
    if (!validatedSession) {
      // Clear invalid cookie
      res.clearCookie(env.AUTH_COOKIE_NAME, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      req.authError = 'Session invalid or expired';
      return next();
    }

    req.auth = {
      userId: validatedSession.userId,
      sessionId: validatedSession.session._id.toString(),
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await optionalAuth(req, res, (err) => {
    if (err) {
      return next(err);
    }
    if (!req.auth) {
      res.status(401).json({ 
        success: false, 
        error: `Unauthorized: ${req.authError || 'Access denied'}` 
      });
      return;
    }
    next();
  });
};
