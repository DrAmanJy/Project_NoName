import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import { logger } from '../../infrastructure/logger.js';
import { oauthService } from './oauth/oauth.service.js';
import { googleProvider } from './oauth/google/google.provider.js';
import { facebookProvider } from './oauth/facebook/facebook.provider.js';
import { appleProvider } from './oauth/apple/apple.provider.js';
import { User, type IUser } from './models/user.model.js';
import { OAuthAccount } from './models/oauth-account.model.js';
import { MobileAuthHandoff } from './models/mobile-handoff.model.js';
import { sessionService } from './session/session.service.js';
import type { User as ContractUser } from '@repo/contracts';
import { MobileHandoffExchangeRequestSchema } from '@repo/contracts';

export class AuthController {
  private setSessionCookie(res: Response, token: string) {
    res.cookie(env.AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: env.AUTH_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    });
  }

  private async getOrCreateOAuthUser(
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

    return user;
  }

  private async finishWebOAuthLogin(
    req: Request,
    res: Response,
    user: IUser,
    providerName: string,
  ) {
    const sessionToken = await sessionService.createSession(
      user._id.toString(),
      req.get('user-agent'),
      req.ip,
    );

    logger.info({ provider: providerName, userId: user._id.toString() }, 'auth.oauth.success');

    this.setSessionCookie(res, sessionToken);

    res.redirect(`${env.FRONTEND_URL}/`);
  }

  // ================= Google =================

  public initiateGoogle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const client = req.query.client === 'mobile' ? 'mobile' : 'web';
      const { state, nonce, codeChallenge } = await oauthService.createTransaction({
        provider: 'google',
        clientType: client,
      });
      logger.info({ provider: 'google', clientType: client }, 'auth.oauth.started');

      const url = googleProvider.getAuthorizationUrl(state, nonce, codeChallenge!);
      res.redirect(url);
    } catch (error) {
      next(error);
    }
  };

  public googleCallback = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
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

      const user = await this.getOrCreateOAuthUser(
        res,
        'google',
        payload.sub,
        payload.email,
        payload.email_verified,
        payload.name,
        payload.picture,
      );
      if (!user) return; // User is inactive, response already sent

      if (transaction.clientType === 'mobile') {
        const code = crypto.randomBytes(32).toString('hex');
        const codeHash = crypto.createHash('sha256').update(code).digest('hex');

        await MobileAuthHandoff.create({
          codeHash,
          userId: user._id,
          transactionId: transaction._id,
          expiresAt: new Date(Date.now() + 60 * 1000),
        });

        logger.info(
          { userId: user._id.toString(), provider: 'google' },
          'auth.mobile_handoff.created',
        );
        const redirectUrl = new URL(env.AUTH_MOBILE_REDIRECT_URI);
        redirectUrl.searchParams.set('code', code);
        res.redirect(redirectUrl.toString());
      } else {
        await this.finishWebOAuthLogin(req, res, user, 'google');
      }
    } catch (error) {
      next(error);
    }
  };

  // ================= Facebook =================

  public initiateFacebook = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
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

  public facebookCallback = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
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

      const user = await this.getOrCreateOAuthUser(
        res,
        'facebook',
        payload.sub,
        payload.email,
        true,
        payload.name,
        payload.picture,
      );
      if (user) await this.finishWebOAuthLogin(req, res, user, 'facebook');
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

      const user = await this.getOrCreateOAuthUser(
        res,
        'apple',
        payload.sub,
        payload.email,
        payload.email_verified,
        name,
      );
      if (user) await this.finishWebOAuthLogin(req, res, user, 'apple');
    } catch (error) {
      next(error);
    }
  };

  // ================= User and Session =================

  public exchangeMobileHandoff = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = MobileHandoffExchangeRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Invalid handoff code' });
        return;
      }

      const codeHash = crypto.createHash('sha256').update(parsed.data.code).digest('hex');
      const now = new Date();

      const handoff = await MobileAuthHandoff.findOneAndUpdate(
        {
          codeHash,
          consumedAt: { $exists: false },
          expiresAt: { $gt: now },
        },
        {
          $set: { consumedAt: now },
        },
        { new: true },
      );

      if (!handoff) {
        logger.warn({ codeHash }, 'auth.mobile_handoff.failed');
        res.status(401).json({ success: false, error: 'Invalid or expired handoff code' });
        return;
      }

      const sessionToken = await sessionService.createSession(
        handoff.userId.toString(),
        req.get('user-agent'),
        req.ip,
      );

      logger.info({ userId: handoff.userId.toString() }, 'auth.mobile_handoff.exchanged');
      res.status(200).json({ success: true, data: { sessionToken } });
    } catch (error) {
      next(error);
    }
  };

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
        role: user.role,
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
