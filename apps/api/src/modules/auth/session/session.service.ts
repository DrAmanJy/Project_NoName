import crypto from 'crypto';
import mongoose from 'mongoose';
import type { ISession } from '../models/session.model.js';
import { Session } from '../models/session.model.js';
import { User } from '../models/user.model.js';
import { env } from '../../../config/env.js';

export interface ValidatedSession {
  session: ISession;
  userId: string;
}

export class SessionService {
  /**
   * Generates a cryptographically secure 256-bit token.
   * Returns both the raw token (to send to the client) and its SHA-256 hash (to store).
   */
  private generateSessionToken(): { rawToken: string; tokenHash: string } {
    const rawBytes = crypto.randomBytes(32); // 256 bits
    const rawToken = rawBytes.toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    return { rawToken, tokenHash };
  }

  /**
   * Hashes a raw token for database lookup.
   */
  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Creates a new session for a user.
   * Returns the raw session token that must be sent to the client via cookie.
   */
  public async createSession(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const { rawToken, tokenHash } = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + env.AUTH_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

    let ipAddressHash: string | undefined;
    if (ipAddress) {
      ipAddressHash = crypto.createHash('sha256').update(ipAddress).digest('hex');
    }

    await Session.create({
      userId: new mongoose.Types.ObjectId(userId),
      sessionTokenHash: tokenHash,
      expiresAt,
      userAgent,
      ipAddressHash,
    });

    return rawToken;
  }

  /**
   * Validates a session token.
   * Checks if it exists, is not expired, not revoked, and the user is active.
   */
  public async validateSession(rawToken: string): Promise<ValidatedSession | null> {
    const tokenHash = this.hashToken(rawToken);

    const session = await Session.findOne({ sessionTokenHash: tokenHash });
    if (!session) {
      return null;
    }

    // Check expiration
    if (session.expiresAt.getTime() < Date.now()) {
      return null;
    }

    // Check revocation
    if (session.revokedAt) {
      return null;
    }

    // Throttled asynchronous update of lastUsedAt (every 5 minutes)
    const now = Date.now();
    const fiveMinutesMs = 5 * 60 * 1000;
    if (!session.lastUsedAt || now - session.lastUsedAt.getTime() > fiveMinutesMs) {
      Session.updateOne(
        { _id: session._id },
        { $set: { lastUsedAt: new Date(now) } }
      ).catch((err) => {
        // Safe fire-and-forget: catch and log the error to avoid unhandled promise rejections
        // Using console.error here; in production, use a proper logger instance
        console.error('Failed to asynchronously update session lastUsedAt', err);
      });
    }

    // Check if user is active - Optimized with lean and projection
    const user = await User.findById(session.userId).select('isActive').lean();
    if (!user || !user.isActive) {
      return null;
    }

    return { session, userId: session.userId.toString() };
  }

  /**
   * Revokes a specific session.
   */
  public async revokeSession(sessionId: string): Promise<void> {
    await Session.findByIdAndUpdate(sessionId, {
      revokedAt: new Date(),
      expiresAt: new Date(), // accelerate TTL cleanup
    });
  }

  /**
   * Revokes all active sessions for a user.
   */
  public async revokeAllSessions(userId: string): Promise<void> {
    await Session.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), revokedAt: { $exists: false } },
      {
        $set: {
          revokedAt: new Date(),
          expiresAt: new Date(),
        },
      },
    );
  }
}

export const sessionService = new SessionService();
