import type { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env.js';
import { logger } from '../../infrastructure/logger.js';
import { oauthService } from './oauth/oauth.service.js';
import { googleProvider } from './oauth/google/google.provider.js';
import { facebookProvider } from './oauth/facebook/facebook.provider.js';
import { appleProvider } from './oauth/apple/apple.provider.js';
import { User } from './models/user.model.js';
import { OAuthAccount } from './models/oauth-account.model.js';
import { sessionService } from './session/session.service.js';
import type { User as ContractUser } from '@repo/contracts';

export class AuthController {
  private setSessionCookie(res: Response, token: string) {
    res.cookie(env.AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: env.AUTH_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    });
  }

  private async handleOAuthLogin(
    req: Request,
    res: Response,
    providerName: 'google' | 'facebook' | 'apple',
    providerAccountId: string,
    email?: string,
    emailVerified?: boolean,
    name?: string,
    avatarUrl?: string,
  ) {
    let oauthAccount = await OAuthAccount.findOne({
      provider: providerName,
      providerAccountId,
    });

    let user;

    if (oauthAccount) {
      user = await User.findById(oauthAccount.userId);
      if (!user) {
        throw new Error('OAuth account exists but User is missing');
      }
      if (!user.isActive) {
        res.status(403).json({ success: false, error: 'User account is inactive' });
        return;
      }
    } else {
      user = await User.create({
        name: name || 'User',
        email,
        avatarUrl,
        isActive: true,
      });

      oauthAccount = await OAuthAccount.create({
        userId: user._id,
        provider: providerName,
        providerAccountId,
        email,
        emailVerified: emailVerified ?? false,
      });
    }

    const sessionToken = await sessionService.createSession(
      user._id.toString(),
      req.get('user-agent'),
      req.ip,
    );

    logger.info({ provider: providerName, userId: user._id.toString() }, 'auth.oauth.success');

    this.setSessionCookie(res, sessionToken);

    res.redirect(`${env.FRONTEND_URL}/auth/success`);
  }

  // ================= Google =================

  public initiateGoogle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { state, nonce, codeChallenge } = await oauthService.createTransaction({
        provider: 'google',
      });
      logger.info({ provider: 'google' }, 'auth.oauth.started');

      const url = googleProvider.getAuthorizationUrl(state, nonce, codeChallenge!);
      res.redirect(url);
    } catch (error) {
      next(error);
    }
  };

  public googleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { state, code } = req.query;
      if (typeof state !== 'string' || typeof code !== 'string') {
        res.status(400).json({ error: 'Missing state or code' });
        return;
      }

      const transaction = await oauthService.consumeTransaction(state, 'google');
      if (!transaction || !transaction.encryptedCodeVerifier || !transaction.nonceHash) {
        logger.warn({ provider: 'google', error: 'invalid_transaction' }, 'auth.oauth.failed');
        res.status(400).json({ error: 'Invalid or expired OAuth transaction' });
        return;
      }

      const codeVerifier = oauthService.decrypt(transaction.encryptedCodeVerifier);
      const idToken = await googleProvider.exchangeCode(code, codeVerifier);

      const payload = await googleProvider.verifyIdToken(idToken, '');
      
      if (oauthService.hashValue(payload.nonce) !== transaction.nonceHash) {
        res.status(400).json({ error: 'Nonce mismatch' });
        return;
      }

      await this.handleOAuthLogin(
        req, res, 'google', payload.sub, payload.email, payload.email_verified, payload.name, payload.picture
      );
    } catch (error) {
      next(error);
    }
  };

  // ================= Facebook =================

  public initiateFacebook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { state } = await oauthService.createTransaction({
        provider: 'facebook',
      });

      const url = facebookProvider.getAuthorizationUrl(state);
      res.redirect(url);
    } catch (error) {
      next(error);
    }
  };

  public facebookCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { state, code } = req.query;
      if (typeof state !== 'string' || typeof code !== 'string') {
        res.status(400).json({ error: 'Missing state or code' });
        return;
      }

      const transaction = await oauthService.consumeTransaction(state, 'facebook');
      if (!transaction) {
        res.status(400).json({ error: 'Invalid or expired OAuth transaction' });
        return;
      }

      const payload = await facebookProvider.exchangeCodeAndVerify(code);

      await this.handleOAuthLogin(
        req, res, 'facebook', payload.sub, payload.email, true, payload.name, payload.picture
      );
    } catch (error) {
      next(error);
    }
  };

  // ================= Apple =================

  public initiateApple = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { state, nonce } = await oauthService.createTransaction({
        provider: 'apple',
      });

      const url = appleProvider.getAuthorizationUrl(state, nonce);
      res.redirect(url);
    } catch (error) {
      next(error);
    }
  };

  public appleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Apple callback can be POST with application/x-www-form-urlencoded
      const state = req.body?.state || req.query?.state;
      const code = req.body?.code || req.query?.code;
      // Apple sometimes sends `user` object in the first request containing name/email
      const userStr = req.body?.user;
      
      if (typeof state !== 'string' || typeof code !== 'string') {
        res.status(400).json({ error: 'Missing state or code' });
        return;
      }

      const transaction = await oauthService.consumeTransaction(state, 'apple');
      if (!transaction || !transaction.nonceHash) {
        res.status(400).json({ error: 'Invalid or expired OAuth transaction' });
        return;
      }

      const idToken = await appleProvider.exchangeCode(code);
      const payload = await appleProvider.verifyIdToken(idToken);
      
      if (oauthService.hashValue(payload.nonce) !== transaction.nonceHash) {
        res.status(400).json({ error: 'Nonce mismatch' });
        return;
      }

      let name = undefined;
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj.name) {
            name = `${userObj.name.firstName || ''} ${userObj.name.lastName || ''}`.trim();
          }
        } catch {
          // ignore parsing error
        }
      }

      await this.handleOAuthLogin(
        req, res, 'apple', payload.sub, payload.email, payload.email_verified, name
      );
    } catch (error) {
      next(error);
    }
  };

  // ================= User and Session =================

  public me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const user = await User.findById(req.auth.userId).lean();
      if (!user) {
        res.status(401).json({ success: false, error: 'User not found' });
        return;
      }

      const userContract: ContractUser = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };

      res.status(200).json({ success: true, data: { user: userContract } });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.auth) {
        await sessionService.revokeSession(req.auth.sessionId);
        logger.info({ userId: req.auth.userId }, 'auth.session.revoked');
        logger.info({ userId: req.auth.userId }, 'auth.logout');
      }
      res.clearCookie(env.AUTH_COOKIE_NAME, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public logoutAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.auth) {
        await sessionService.revokeAllSessions(req.auth.userId);
      }
      res.clearCookie(env.AUTH_COOKIE_NAME, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();

