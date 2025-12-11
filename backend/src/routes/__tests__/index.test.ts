import request from 'supertest';
import express from 'express';
import { router } from '../index.js';
import { AgentManager } from '../../agents/agent-manager.js';
import { WorkOSAuth } from '../../auth/workos-auth.js';
import { StripeBilling } from '../../billing/stripe-billing.js';
import { SmartSQL } from '../../services/smart-sql.js';
import { SmartMemory } from '../../services/smart-memory.js';

describe('API Routes', () => {
  let app: express.Application;
  let mockAgentManager: jest.Mocked<AgentManager>;
  let mockWorkOSAuth: jest.Mocked<WorkOSAuth>;
  let mockStripeBilling: jest.Mocked<StripeBilling>;
  let mockSmartSQL: jest.Mocked<SmartSQL>;
  let mockSmartMemory: jest.Mocked<SmartMemory>;

  beforeEach(() => {
    mockAgentManager = {
      initializeAgents: jest.fn(),
      getAgents: jest.fn(),
      chatWithAgent: jest.fn(),
      createWeeklyPlan: jest.fn(),
      generateMarketingAssets: jest.fn(),
      runFinancialForecast: jest.fn(),
    } as any;

    mockWorkOSAuth = {
      sendMagicLink: jest.fn(),
      exchangeCodeForToken: jest.fn(),
      verifyToken: jest.fn(),
    } as any;

    mockStripeBilling = {
      createCheckoutSession: jest.fn(),
      createPortalSession: jest.fn(),
      getSubscriptionStatus: jest.fn(),
      handleWebhook: jest.fn(),
    } as any;

    mockSmartSQL = {
      select: jest.fn(),
      insert: jest.fn(),
    } as any;

    mockSmartMemory = {
      write: jest.fn(),
      read: jest.fn(),
      list: jest.fn(),
    } as any;

    app = express();
    app.use(express.json());
    app.use('/api', router(mockAgentManager, mockWorkOSAuth, mockStripeBilling, mockSmartSQL, mockSmartMemory));
  });

  describe('POST /api/auth/magic-link', () => {
    it('should send magic link', async () => {
      mockWorkOSAuth.sendMagicLink.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/magic-link')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockWorkOSAuth.sendMagicLink).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle errors', async () => {
      mockWorkOSAuth.sendMagicLink.mockRejectedValue(new Error('Failed'));

      const response = await request(app)
        .post('/api/auth/magic-link')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/onboarding', () => {
    it('should complete onboarding', async () => {
      mockSmartSQL.insert.mockResolvedValue({ id: 'business-123' });
      mockAgentManager.initializeAgents.mockResolvedValue(undefined);
      mockSmartMemory.write.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/onboarding')
        .send({
          userId: 'user-123',
          businessType: 'SaaS',
          answers: { q1: 'answer1' },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockSmartSQL.insert).toHaveBeenCalled();
      expect(mockAgentManager.initializeAgents).toHaveBeenCalled();
    });
  });

  describe('GET /api/agents', () => {
    it('should return agents list', async () => {
      mockAgentManager.getAgents.mockResolvedValue([
        { id: 'ceo', name: 'CEO Agent', description: 'Strategic planning', status: 'active' },
      ]);

      const response = await request(app).get('/api/agents?userId=user-123');

      expect(response.status).toBe(200);
      expect(response.body.agents).toHaveLength(1);
    });

    it('should require userId', async () => {
      const response = await request(app).get('/api/agents');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/agents/:agentId/chat', () => {
    it('should chat with agent', async () => {
      mockAgentManager.chatWithAgent.mockResolvedValue({
        response: 'Hello',
        agentId: 'ceo',
      });

      const response = await request(app)
        .post('/api/agents/ceo/chat')
        .send({
          userId: 'user-123',
          message: 'Hello',
        });

      expect(response.status).toBe(200);
      expect(response.body.response).toBe('Hello');
      expect(mockAgentManager.chatWithAgent).toHaveBeenCalledWith(
        'user-123',
        'ceo',
        'Hello',
        undefined
      );
    });
  });

  describe('POST /api/workflows/create-weekly-plan', () => {
    it('should create weekly plan', async () => {
      mockAgentManager.createWeeklyPlan.mockResolvedValue({
        plan: 'Weekly plan',
        saved: true,
      });

      const response = await request(app)
        .post('/api/workflows/create-weekly-plan')
        .send({
          userId: 'user-123',
          businessId: 'business-123',
        });

      expect(response.status).toBe(200);
      expect(response.body.plan).toBe('Weekly plan');
    });
  });

  describe('GET /api/dashboard', () => {
    it('should return dashboard data', async () => {
      mockSmartSQL.select.mockResolvedValue([{ id: 'business-123', type: 'SaaS' }]);
      mockSmartMemory.read
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(null);

      const response = await request(app).get('/api/dashboard?userId=user-123');

      expect(response.status).toBe(200);
      expect(response.body.business).toBeDefined();
    });
  });

  describe('GET /api/billing/status', () => {
    it('should return billing status', async () => {
      mockStripeBilling.getSubscriptionStatus.mockResolvedValue('active');

      const response = await request(app).get('/api/billing/status?userId=user-123');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('active');
    });
  });
});

