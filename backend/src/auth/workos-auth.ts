import { WorkOS } from '@workos-inc/node';

export class WorkOSAuth {
  private client: WorkOS;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.WORKOS_CLIENT_ID || '';
    this.clientSecret = process.env.WORKOS_CLIENT_SECRET || '';
    this.redirectUri = process.env.WORKOS_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';
    
    this.client = new WorkOS(this.clientSecret);
  }

  async getAuthorizationUrl(state?: string): Promise<string> {
    const url = (this.client.userManagement as any).getAuthorizationUrl({
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      provider: 'email',
      state: state || crypto.randomUUID(),
    });

    return url.toString();
  }

  async exchangeCodeForToken(code: string): Promise<{ accessToken: string; user: any }> {
    try {
      const { accessToken, user } = await (this.client.userManagement as any).authenticateWithEmail({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        code,
        redirectUri: this.redirectUri,
      });

      return { accessToken, user };
    } catch (error) {
      console.error('WorkOS auth error:', error);
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async sendMagicLink(email: string, state?: string): Promise<void> {
    try {
      await (this.client.userManagement as any).sendMagicLink({
        email,
        clientId: this.clientId,
        redirectUri: this.redirectUri,
        state: state || crypto.randomUUID(),
      });
    } catch (error) {
      console.error('WorkOS magic link error:', error);
      throw new Error(`Failed to send magic link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUser(accessToken: string): Promise<any> {
    try {
      const user = await (this.client.userManagement as any).getUser(accessToken);
      return user;
    } catch (error) {
      console.error('WorkOS getUser error:', error);
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

