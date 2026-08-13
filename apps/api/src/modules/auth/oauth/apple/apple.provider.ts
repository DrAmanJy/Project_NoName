import { env } from '../../../../config/env.js';
import * as jose from 'jose';

export class AppleProvider {
  private readonly authorizationUri = 'https://appleid.apple.com/auth/authorize';
  private readonly tokenUri = 'https://appleid.apple.com/auth/token';
  private readonly jwksUri = 'https://appleid.apple.com/auth/keys';
  private readonly issuer = 'https://appleid.apple.com';

  public getAuthorizationUrl(state: string, nonce: string): string {
    const params = new URLSearchParams({
      client_id: env.APPLE_CLIENT_ID,
      redirect_uri: env.APPLE_REDIRECT_URI,
      response_type: 'code id_token',
      scope: 'name email',
      response_mode: 'form_post', // Apple requires form_post when requesting name/email
      state,
      nonce,
    });

    return `${this.authorizationUri}?${params.toString()}`;
  }

  private cachedClientSecret: string | null = null;
  private clientSecretExpiresAt: number = 0;

  /**
   * Generates or retrieves the cached client_secret JWT required by Apple.
   */
  private async getClientSecret(): Promise<string> {
    const now = Date.now();
    // Refresh if it expires in less than 1 minute (60000ms)
    if (this.cachedClientSecret && this.clientSecretExpiresAt - now > 60000) {
      return this.cachedClientSecret;
    }

    const privateKeyStr = env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const privateKey = await jose.importPKCS8(privateKeyStr, 'ES256');

    // Apple secrets can be valid up to 6 months. We'll use 1 hour to be safe.
    const expiresInSeconds = 3600;
    const jwt = await new jose.SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: env.APPLE_KEY_ID })
      .setIssuer(env.APPLE_TEAM_ID)
      .setIssuedAt()
      .setExpirationTime(`${expiresInSeconds}s`)
      .setAudience(this.issuer)
      .setSubject(env.APPLE_CLIENT_ID)
      .sign(privateKey);

    this.cachedClientSecret = jwt;
    this.clientSecretExpiresAt = now + expiresInSeconds * 1000;

    return jwt;
  }

  public async exchangeCode(code: string): Promise<string> {
    const clientSecret = await this.getClientSecret();

    const params = new URLSearchParams({
      client_id: env.APPLE_CLIENT_ID,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: env.APPLE_REDIRECT_URI,
    });

    const response = await fetch(this.tokenUri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Apple token exchange failed: ${errorText}`);
    }

    const data = (await response.json()) as unknown;
    if (!data || typeof data !== 'object') {
      throw new Error('Apple token exchange returned invalid data');
    }
    
    const idToken = (data as Record<string, unknown>).id_token;
    if (typeof idToken !== 'string') {
      throw new Error('Apple did not return a valid id_token');
    }

    return idToken;
  }

  public async verifyIdToken(idToken: string): Promise<{
    sub: string;
    email?: string;
    email_verified?: boolean;
    nonce: string;
  }> {
    const JWKS = jose.createRemoteJWKSet(new URL(this.jwksUri));

    const { payload } = await jose.jwtVerify(idToken, JWKS, {
      issuer: this.issuer,
      audience: env.APPLE_CLIENT_ID,
    });

    if (!payload.sub) {
      throw new Error('Apple ID token missing subject (sub)');
    }
    
    if (!payload.nonce || typeof payload.nonce !== 'string') {
      throw new Error('Apple ID token missing nonce');
    }

    // Apple provides a string 'true' or 'false' for email_verified sometimes, or a boolean.
    let emailVerified = false;
    if (payload.email_verified === 'true' || payload.email_verified === true) {
      emailVerified = true;
    }

    return {
      sub: payload.sub,
      email: payload.email as string | undefined,
      email_verified: emailVerified,
      nonce: payload.nonce,
    };
  }
}

export const appleProvider = new AppleProvider();
