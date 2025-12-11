import { WorkOSAuth } from '../workos-auth.js';
import { WorkOS } from '@workos-inc/node';

jest.mock('@workos-inc/node');

describe('WorkOSAuth', () => {
  let workOSAuth: WorkOSAuth;
  let mockWorkOS: jest.Mocked<WorkOS>;

  beforeEach(() => {
    process.env.WORKOS_CLIENT_ID = 'test-client-id';
    process.env.WORKOS_CLIENT_SECRET = 'test-secret';
    process.env.WORKOS_REDIRECT_URI = 'http://localhost:3000/callback';

    mockWorkOS = {
      userManagement: {
        getAuthorizationUrl: jest.fn(),
        authenticateWithEmail: jest.fn(),
        sendMagicLink: jest.fn(),
        getUser: jest.fn(),
      },
    } as any;

    (WorkOS as jest.Mock).mockImplementation(() => mockWorkOS);
    workOSAuth = new WorkOSAuth();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMagicLink', () => {
    it('should send magic link', async () => {
      mockWorkOS.userManagement.sendMagicLink.mockResolvedValue(undefined);

      await workOSAuth.sendMagicLink('test@example.com');

      expect(mockWorkOS.userManagement.sendMagicLink).toHaveBeenCalledWith({
        email: 'test@example.com',
        clientId: 'test-client-id',
        redirectUri: 'http://localhost:3000/callback',
        state: expect.any(String),
      });
    });

    it('should handle errors', async () => {
      mockWorkOS.userManagement.sendMagicLink.mockRejectedValue(new Error('Failed'));

      await expect(workOSAuth.sendMagicLink('test@example.com')).rejects.toThrow('Failed to send magic link');
    });
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange code for token', async () => {
      const mockToken = { accessToken: 'token-123', user: { id: 'user-123' } };
      mockWorkOS.userManagement.authenticateWithEmail.mockResolvedValue(mockToken);

      const result = await workOSAuth.exchangeCodeForToken('code-123');

      expect(mockWorkOS.userManagement.authenticateWithEmail).toHaveBeenCalledWith({
        clientId: 'test-client-id',
        clientSecret: 'test-secret',
        code: 'code-123',
        redirectUri: 'http://localhost:3000/callback',
      });
      expect(result).toEqual(mockToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      mockWorkOS.userManagement.getUser.mockResolvedValue({ id: 'user-123' });

      const result = await workOSAuth.verifyToken('valid-token');

      expect(result.valid).toBe(true);
      expect(result.userId).toBe('user-123');
    });

    it('should return invalid for invalid token', async () => {
      mockWorkOS.userManagement.getUser.mockRejectedValue(new Error('Invalid'));

      const result = await workOSAuth.verifyToken('invalid-token');

      expect(result.valid).toBe(false);
    });
  });
});

