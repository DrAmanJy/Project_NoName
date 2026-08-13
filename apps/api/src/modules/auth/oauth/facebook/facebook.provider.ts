import { env } from '../../../../config/env.js';

export class FacebookProvider {
  private readonly authorizationUri = 'https://www.facebook.com/v19.0/dialog/oauth';
  private readonly tokenUri = 'https://graph.facebook.com/v19.0/oauth/access_token';
  private readonly debugTokenUri = 'https://graph.facebook.com/debug_token';
  private readonly profileUri = 'https://graph.facebook.com/me';

  public getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: env.FACEBOOK_APP_ID,
      redirect_uri: env.FACEBOOK_REDIRECT_URI,
      state,
      scope: 'email,public_profile',
      response_type: 'code',
    });

    return `${this.authorizationUri}?${params.toString()}`;
  }

  public async exchangeCodeAndVerify(code: string): Promise<{
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
  }> {
    // 1. Exchange code for access token
    const tokenParams = new URLSearchParams({
      client_id: env.FACEBOOK_APP_ID,
      client_secret: env.FACEBOOK_APP_SECRET,
      redirect_uri: env.FACEBOOK_REDIRECT_URI,
      code,
    });

    const tokenResponse = await fetch(`${this.tokenUri}?${tokenParams.toString()}`, { signal: AbortSignal.timeout(10000) });
    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      throw new Error(`Facebook token exchange failed: ${errText}`);
    }

    const tokenData = (await tokenResponse.json()) as unknown;
    if (!tokenData || typeof tokenData !== 'object') {
      throw new Error('Facebook token exchange returned invalid data');
    }
    const accessToken = (tokenData as Record<string, unknown>).access_token;
    if (typeof accessToken !== 'string') {
      throw new Error('Facebook did not return an access_token');
    }

    // 2. Verify token using /debug_token to ensure it belongs to our application
    // We use the app access token (app_id|app_secret) to verify the user access token
    const appAccessToken = `${env.FACEBOOK_APP_ID}|${env.FACEBOOK_APP_SECRET}`;
    const debugParams = new URLSearchParams({
      input_token: accessToken,
      access_token: appAccessToken,
    });

    const debugResponse = await fetch(`${this.debugTokenUri}?${debugParams.toString()}`, { signal: AbortSignal.timeout(10000) });
    if (!debugResponse.ok) {
      const errText = await debugResponse.text();
      throw new Error(`Facebook token verification failed: ${errText}`);
    }

    const debugData = (await debugResponse.json()) as unknown;
    if (!debugData || typeof debugData !== 'object') {
      throw new Error('Facebook token verification returned invalid data');
    }
    const dataObj = (debugData as Record<string, Record<string, unknown>>).data;
    if (!dataObj || dataObj.app_id !== env.FACEBOOK_APP_ID) {
      throw new Error('Facebook token does not belong to this application');
    }
    if (!dataObj.is_valid) {
      throw new Error('Facebook token is invalid');
    }
    const facebookUserId = dataObj.user_id;
    if (typeof facebookUserId !== 'string') {
      throw new Error('Facebook token missing user_id');
    }

    // 3. Fetch user profile data
    const profileParams = new URLSearchParams({
      fields: 'id,name,email,picture.type(large)',
      access_token: accessToken,
    });

    const profileResponse = await fetch(`${this.profileUri}?${profileParams.toString()}`, { signal: AbortSignal.timeout(10000) });
    if (!profileResponse.ok) {
      const errText = await profileResponse.text();
      throw new Error(`Facebook profile fetch failed: ${errText}`);
    }

    const profileData = (await profileResponse.json()) as unknown;
    if (!profileData || typeof profileData !== 'object') {
      throw new Error('Facebook profile fetch returned invalid data');
    }
    const pData = profileData as Record<string, unknown>;

    if (pData.id !== facebookUserId) {
      throw new Error('Facebook profile ID mismatch');
    }

    let pictureUrl: string | undefined;
    const pictureObj = pData.picture as Record<string, Record<string, unknown>> | undefined;
    if (pictureObj?.data?.url && typeof pictureObj.data.url === 'string') {
      pictureUrl = pictureObj.data.url;
    }

    return {
      sub: pData.id as string,
      email: typeof pData.email === 'string' ? pData.email : undefined,
      name: typeof pData.name === 'string' ? pData.name : undefined,
      picture: pictureUrl,
    };
  }
}

export const facebookProvider = new FacebookProvider();
