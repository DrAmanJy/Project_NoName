import { Router } from 'express';
import { authController } from './auth.controller.js';
import { requireAuth } from './auth.middleware.js';
import { rateLimit } from 'express-rate-limit';

export const authRoutes = Router();

// Stricter rate limiting for OAuth initiation and callbacks
const oauthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs for oauth routes
  standardHeaders: true,
  legacyHeaders: false,
});

// Google
authRoutes.get('/google', oauthRateLimiter, authController.initiateGoogle);
authRoutes.get('/google/callback', oauthRateLimiter, authController.googleCallback);

// Facebook
authRoutes.get('/facebook', oauthRateLimiter, authController.initiateFacebook);
authRoutes.get('/facebook/callback', oauthRateLimiter, authController.facebookCallback);

// Apple
authRoutes.get('/apple', oauthRateLimiter, authController.initiateApple);
authRoutes.post('/apple/callback', oauthRateLimiter, authController.appleCallback);

authRoutes.post('/mobile/exchange', oauthRateLimiter, authController.exchangeMobileHandoff);

// Session endpoints
authRoutes.get('/me', requireAuth, authController.me);
authRoutes.post('/logout', requireAuth, authController.logout);
authRoutes.post('/logout-all', requireAuth, authController.logoutAll);
