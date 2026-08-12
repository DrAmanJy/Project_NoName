export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null>;
  credentials?: RequestCredentials;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getAccessToken?: () => Promise<string | null>;
  private readonly credentials?: RequestCredentials;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.getAccessToken = config.getAccessToken;
    this.credentials = config.credentials;
  }

  private async buildHeaders(customHeaders?: HeadersInit): Promise<Headers> {
    const headers = new Headers(customHeaders);

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.getAccessToken) {
      const token = await this.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = await this.buildHeaders(options.headers);

    const response = await fetch(url, {
      credentials: this.credentials,
      ...options,
      headers,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new ApiError(response.status, response.statusText, body);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}
