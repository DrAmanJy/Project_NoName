import { env } from '../../../../config/env.js';
import * as jose from 'jose';

export class GoogleProvider {
  private readonly issuer = 'https://accounts.google.com';
  private readonly jwksUri = 'https://www.googleapis.com/oauth2/v3/certs';
  private readonly tokenUri = 'https://oauth2.googleapis.com/token';

  public getAuthorizationUrl(state: string, nonce: string, codeChallenge: string): string {
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      access_type: 'online',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  public async exchangeCode(code: string, codeVerifier: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: env.GOOGLE_REDIRECT_URI,
    });

    const response = await fetch(this.tokenUri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google token exchange failed: ${errorText}`);
    }

    const data = (await response.json()) as unknown;
    
    if (!data || typeof data !== 'object') {
      throw new Error('Google token exchange returned invalid data');
    }
    
    const idToken = (data as Record<string, unknown>).id_token;
    if (typeof idToken !== 'string') {
      throw new Error('Google did not return a valid id_token');
    }

    return idToken;
  }

  public async verifyIdToken(idToken: string, _expectedNonceHash: string): Promise<{
    sub: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
    nonce: string;
  }> {
    const JWKS = jose.createRemoteJWKSet(new URL(this.jwksUri));

    const { payload } = await jose.jwtVerify(idToken, JWKS, {
      issuer: [this.issuer, 'accounts.google.com'],
      audience: env.GOOGLE_CLIENT_ID,
    });

    // Hash the plain nonce from the token and compare it with the stored hash
    const tokenNonce = payload.nonce as string | undefined;
    if (!tokenNonce) {
      throw new Error('Google ID token missing nonce');
    }
    
    if (!payload.sub) {
      throw new Error('Google ID token missing subject (sub)');
    }
    
    return {
      sub: payload.sub,
      email: payload.email as string | undefined,
      email_verified: payload.email_verified as boolean | undefined,
      name: payload.name as string | undefined,
      picture: payload.picture as string | undefined,
      nonce: tokenNonce as string,
    };
  }
}

export const googleProvider = new GoogleProvider();
