import { AgentManager } from '../agent-manager.js';
import { SmartInference } from '../../services/smart-inference.js';
import { SmartMemory } from '../../services/smart-memory.js';
import { SmartSQL } from '../../services/smart-sql.js';
import { SmartBuckets } from '../../services/smart-buckets.js';

describe('AgentManager', () => {
  let agentManager: AgentManager;
  let mockSmartInference: jest.Mocked<SmartInference>;
  let mockSmartMemory: jest.Mocked<SmartMemory>;
  let mockSmartSQL: jest.Mocked<SmartSQL>;
  let mockSmartBuckets: jest.Mocked<SmartBuckets>;

  beforeEach(() => {
    mockSmartInference = {
      infer: jest.fn(),
      chat: jest.fn(),
    } as any;

    mockSmartMemory = {
      read: jest.fn(),
      write: jest.fn(),
      append: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    } as any;

    mockSmartSQL = {
      query: jest.fn(),
      execute: jest.fn(),
      createTable: jest.fn(),
      insert: jest.fn(),
      select: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockSmartBuckets = {
      upload: jest.fn(),
      download: jest.fn(),
      list: jest.fn(),
      delete: jest.fn(),
      getMetadata: jest.fn(),
    } as any;

    agentManager = new AgentManager(
      mockSmartInference,
      mockSmartMemory,
      mockSmartSQL,
      mockSmartBuckets
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeAgents', () => {
    it('should initialize agents with shared memory', async () => {
      mockSmartMemory.write.mockResolvedValue(undefined);

      await agentManager.initializeAgents('user-123', 'business-123');

      expect(mockSmartMemory.write).toHaveBeenCalledWith(
        'agents:initialized',
        'user-123',
        expect.objectContaining({
          businessId: 'business-123',
        })
      );
      expect(mockSmartMemory.write).toHaveBeenCalledWith(
        'agents:config',
        'user-123',
        expect.objectContaining({
          ceo: { enabled: true },
          marketing: { enabled: true },
          finance: { enabled: true },
          product: { enabled: true },
          sales: { enabled: true },
        })
      );
    });
  });

  describe('getAgents', () => {
    it('should return all agents', async () => {
      const agents = await agentManager.getAgents('user-123');

      expect(agents).toHaveLength(5);
      expect(agents.map((a) => a.id)).toEqual(['ceo', 'marketing', 'finance', 'product', 'sales']);
      expect(agents.every((a) => a.status === 'active')).toBe(true);
    });
  });

  describe('chatWithAgent', () => {
    it('should route to CEO agent', async () => {
      const ceoAgent = (agentManager as any).ceoAgent;
      jest.spyOn(ceoAgent, 'chat').mockResolvedValue({ response: 'CEO response', agentId: 'ceo' });

      const result = await agentManager.chatWithAgent('user-123', 'ceo', 'Hello', 'business-123');

      expect(ceoAgent.chat).toHaveBeenCalledWith('user-123', 'Hello', 'business-123');
      expect(result.response).toBe('CEO response');
    });

    it('should route to Marketing agent', async () => {
      const marketingAgent = (agentManager as any).marketingAgent;
      jest
        .spyOn(marketingAgent, 'chat')
        .mockResolvedValue({ response: 'Marketing response', agentId: 'marketing' });

      const result = await agentManager.chatWithAgent(
        'user-123',
        'marketing',
        'Hello',
        'business-123'
      );

      expect(marketingAgent.chat).toHaveBeenCalledWith('user-123', 'Hello', 'business-123');
      expect(result.response).toBe('Marketing response');
    });

    it('should throw error for unknown agent', async () => {
      await expect(
        agentManager.chatWithAgent('user-123', 'unknown', 'Hello', 'business-123')
      ).rejects.toThrow('Unknown agent: unknown');
    });

    it('should get businessId if not provided', async () => {
      mockSmartSQL.select.mockResolvedValue([{ id: 'business-123' }]);
      const ceoAgent = (agentManager as any).ceoAgent;
      jest.spyOn(ceoAgent, 'chat').mockResolvedValue({ response: 'Response', agentId: 'ceo' });

      await agentManager.chatWithAgent('user-123', 'ceo', 'Hello');

      expect(mockSmartSQL.select).toHaveBeenCalledWith('businesses', { userId: 'user-123' });
      expect(ceoAgent.chat).toHaveBeenCalledWith('user-123', 'Hello', 'business-123');
    });
  });

  describe('createWeeklyPlan', () => {
    it('should delegate to CEO agent', async () => {
      const ceoAgent = (agentManager as any).ceoAgent;
      jest
        .spyOn(ceoAgent, 'createWeeklyPlan')
        .mockResolvedValue({ plan: 'Weekly plan', saved: true });

      const result = await agentManager.createWeeklyPlan('user-123', 'business-123');

      expect(ceoAgent.createWeeklyPlan).toHaveBeenCalledWith('user-123', 'business-123');
      expect(result.plan).toBe('Weekly plan');
    });
  });

  describe('generateMarketingAssets', () => {
    it('should delegate to Marketing agent', async () => {
      const marketingAgent = (agentManager as any).marketingAgent;
      jest
        .spyOn(marketingAgent, 'generateAssets')
        .mockResolvedValue({ assets: [], saved: true });

      const result = await agentManager.generateMarketingAssets(
        'user-123',
        'business-123',
        'ad_copy'
      );

      expect(marketingAgent.generateAssets).toHaveBeenCalledWith(
        'user-123',
        'business-123',
        'ad_copy'
      );
      expect(result.saved).toBe(true);
    });
  });

  describe('runFinancialForecast', () => {
    it('should delegate to Finance agent', async () => {
      const financeAgent = (agentManager as any).financeAgent;
      jest
        .spyOn(financeAgent, 'runForecast')
        .mockResolvedValue({ forecast: {}, saved: true });

      const result = await agentManager.runFinancialForecast('user-123', 'business-123');

      expect(financeAgent.runForecast).toHaveBeenCalledWith('user-123', 'business-123');
      expect(result.saved).toBe(true);
    });
  });
});

