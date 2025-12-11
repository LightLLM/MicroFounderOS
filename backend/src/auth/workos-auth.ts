import { WorkOS } from '@workos-inc/node';

// A lightweight stub used when no API key is present so the app can start in dev
const createMissingKeyStub = () => ({
  userManagement: {
    getAuthorizationUrl: () => { throw new Error('WorkOS API key missing — set WORKOS_API_KEY'); },
    authenticateWithEmail: () => Promise.reject(new Error('WorkOS API key missing — set WORKOS_API_KEY')),
    sendMagicLink: () => Promise.reject(new Error('WorkOS API key missing — set WORKOS_API_KEY')),
    getUser: () => Promise.reject(new Error('WorkOS API key missing — set WORKOS_API_KEY')),
  },
});

export class WorkOSAuth {
  private client: any | null = null;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.WORKOS_CLIENT_ID || '';
    this.clientSecret = process.env.WORKOS_CLIENT_SECRET || '';
    this.redirectUri = process.env.WORKOS_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';
    // Do not construct WorkOS here to avoid throwing on startup if no key is present.
  }

  private getClient() {
    if (this.client) return this.client;
    const apiKey = process.env.WORKOS_API_KEY || this.clientSecret;
    if (apiKey) {
      this.client = new WorkOS(apiKey);
    } else {
      // create a stub that will error only when used
      this.client = createMissingKeyStub();
    }
    return this.client;
  }

  async getAuthorizationUrl(state?: string): Promise<string> {
    const client = this.getClient();
    const url = (client.userManagement as any).getAuthorizationUrl({
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      provider: 'email',
      state: state || crypto.randomUUID(),
    });

    return url.toString();
  }

  async exchangeCodeForToken(code: string): Promise<{ accessToken: string; user: any }> {
    try {
      const client = this.getClient();
      const { accessToken, user } = await (client.userManagement as any).authenticateWithEmail({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        code,
        redirectUri: this.redirectUri,
      });

      return { accessToken, user };
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') console.error('WorkOS auth error:', error);
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async sendMagicLink(email: string, state?: string): Promise<void> {
    try {
      const client = this.getClient();
      await (client.userManagement as any).sendMagicLink({
        email,
        clientId: this.clientId,
        redirectUri: this.redirectUri,
        state: state || crypto.randomUUID(),
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') console.error('WorkOS magic link error:', error);
      throw new Error(`Failed to send magic link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUser(accessToken: string): Promise<any> {
    try {
      const client = this.getClient();
      const user = await (client.userManagement as any).getUser(accessToken);
      return user;
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') console.error('WorkOS getUser error:', error);
      throw new Error(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifyToken(token: string): Promise<{ valid: boolean; userId?: string }> {
    try {
      const user = await this.getUser(token);
      return { valid: true, userId: user.id };
    } catch (error) {
      return { valid: false };
    }
  }
}

