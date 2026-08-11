import crypto from 'crypto';
import { env } from '../../../config/env.js';
import type { IOAuthTransaction } from '../models/oauth-transaction.model.js';
import { OAuthTransaction } from '../models/oauth-transaction.model.js';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM


export class OAuthService {
  /**
   * Hashes a value (e.g. state or nonce) to store securely.
   */
  public hashValue(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  /**
   * Symmetrically encrypts a value (like the PKCE code_verifier).
   * Format: iv:authTag:encryptedData
   */
  public encrypt(value: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = Buffer.from(env.AUTH_ENCRYPTION_KEY, 'utf-8'); // Must be 32 bytes
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    let encrypted = cipher.update(value, 'utf8').toString('hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts a previously encrypted value.
   */
  public decrypt(encryptedString: string): string {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex as string, 'hex');
    const authTag = Buffer.from(authTagHex as string, 'hex');
    const key = Buffer.from(env.AUTH_ENCRYPTION_KEY, 'utf-8');

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex as string, 'hex').toString('utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generates a random PKCE code verifier and challenge.
   */
  public generatePKCE(): { codeVerifier: string; codeChallenge: string } {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    return { codeVerifier, codeChallenge };
  }

  /**
   * Generates a random state and nonce.
   */
  public generateStateAndNonce(): { state: string; nonce: string } {
    const state = crypto.randomBytes(32).toString('base64url');
    const nonce = crypto.randomBytes(32).toString('base64url');
    return { state, nonce };
  }

  /**
   * Starts an OAuth transaction. Stores it in the database and returns the state/nonce/challenge.
   */
  public async createTransaction(params: {
    provider: 'google' | 'facebook' | 'apple';
    clientType?: 'web' | 'mobile';
    redirectUri?: string;
  }): Promise<{ state: string; nonce: string; codeVerifier?: string; codeChallenge?: string }> {
    const { state, nonce } = this.generateStateAndNonce();
    
    // We only need PKCE for providers that support it (Google, maybe others)
    let codeVerifier: string | undefined;
    let codeChallenge: string | undefined;
    let encryptedCodeVerifier: string | undefined;

    if (params.provider === 'google') {
      const pkce = this.generatePKCE();
      codeVerifier = pkce.codeVerifier;
      codeChallenge = pkce.codeChallenge;
      encryptedCodeVerifier = this.encrypt(codeVerifier);
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OAuthTransaction.create({
      provider: params.provider,
      clientType: params.clientType || 'web',
      stateHash: this.hashValue(state),
      nonceHash: this.hashValue(nonce),
      encryptedCodeVerifier,
      redirectUri: params.redirectUri,
      expiresAt,
    });

    return { state, nonce, codeVerifier, codeChallenge };
  }

  /**
   * Consumes an OAuth transaction atomically, preventing replay attacks.
   */
  public async consumeTransaction(state: string, provider: 'google' | 'facebook' | 'apple'): Promise<IOAuthTransaction | null> {
    const stateHash = this.hashValue(state);

    // Atomically find and mark as consumed
    const transaction = await OAuthTransaction.findOneAndUpdate(
      {
        provider,
        stateHash,
        consumedAt: { $exists: false },
        expiresAt: { $gt: new Date() },
      },
      {
        $set: { consumedAt: new Date() },
      },
      { new: true } // Returns the updated document
    );

    return transaction;
  }
}

export const oauthService = new OAuthService();
