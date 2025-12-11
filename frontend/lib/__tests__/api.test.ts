import * as api from '../api';

// Mock fetch
global.fetch = jest.fn();

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('sendMagicLink', () => {
    it('should send magic link request', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.sendMagicLink('test@example.com');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/magic-link'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      );
    });
  });

  describe('completeOnboarding', () => {
    it('should complete onboarding', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, businessId: 'business-123' }),
      });

      const result = await api.completeOnboarding('user-123', 'SaaS', { q1: 'answer1' });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/onboarding'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result.success).toBe(true);
    });
  });

  describe('getAgents', () => {
    it('should fetch agents list', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ agents: [] }),
      });

      await api.getAgents('user-123');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/agents?userId=user-123'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  describe('chatWithAgent', () => {
    it('should send chat message', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'Hello', agentId: 'ceo' }),
      });

      const result = await api.chatWithAgent('user-123', 'ceo', 'Hello');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/agents/ceo/chat'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result.response).toBe('Hello');
    });
  });

  describe('error handling', () => {
    it('should throw error on failed request', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Test error' }),
      });

      await expect(api.sendMagicLink('test@example.com')).rejects.toThrow('Test error');
    });

    it('should include token in headers when available', async () => {
      localStorage.setItem('accessToken', 'test-token');
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await api.getAgents('user-123');

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });
});

