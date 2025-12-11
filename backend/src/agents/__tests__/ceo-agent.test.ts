import { CEOAgent } from '../ceo-agent.js';
import { SmartInference } from '../../services/smart-inference.js';
import { SmartMemory } from '../../services/smart-memory.js';
import { SmartSQL } from '../../services/smart-sql.js';

describe('CEOAgent', () => {
  let ceoAgent: CEOAgent;
  let mockSmartInference: jest.Mocked<SmartInference>;
  let mockSmartMemory: jest.Mocked<SmartMemory>;
  let mockSmartSQL: jest.Mocked<SmartSQL>;

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

    ceoAgent = new CEOAgent(mockSmartInference, mockSmartMemory, mockSmartSQL);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('chat', () => {
    it('should chat with user and return response', async () => {
      const businessData = {
        id: 'business-123',
        type: 'SaaS',
        industry: 'Tech',
        stage: 'Early',
      };

      mockSmartSQL.select.mockResolvedValue([businessData]);
      mockSmartMemory.read.mockResolvedValue([]);
      mockSmartInference.chat.mockResolvedValue('Here is your strategic guidance...');

      const result = await ceoAgent.chat('user-123', 'What should I focus on?', 'business-123');

      expect(mockSmartSQL.select).toHaveBeenCalledWith('businesses', { id: 'business-123' });
      expect(mockSmartInference.chat).toHaveBeenCalled();
      expect(result.response).toBe('Here is your strategic guidance...');
      expect(result.agentId).toBe('ceo');
    });

    it('should save conversation to memory', async () => {
      mockSmartSQL.select.mockResolvedValue([{ type: 'SaaS' }]);
      mockSmartMemory.read.mockResolvedValue([]);
      mockSmartInference.chat.mockResolvedValue('Response');

      await ceoAgent.chat('user-123', 'Test message', 'business-123');

      expect(mockSmartMemory.append).toHaveBeenCalledTimes(2);
      expect(mockSmartMemory.append).toHaveBeenCalledWith(
        'ceo:recent',
        'user-123',
        expect.objectContaining({ role: 'user', content: 'Test message' })
      );
      expect(mockSmartMemory.append).toHaveBeenCalledWith(
        'ceo:recent',
        'user-123',
        expect.objectContaining({ role: 'assistant', content: 'Response' })
      );
    });

    it('should include recent memory in context', async () => {
      const recentMemory = [
        { role: 'user', content: 'Previous question', timestamp: Date.now() },
        { role: 'assistant', content: 'Previous answer', timestamp: Date.now() },
      ];

      mockSmartSQL.select.mockResolvedValue([{ type: 'SaaS' }]);
      mockSmartMemory.read.mockResolvedValue(recentMemory);
      mockSmartInference.chat.mockResolvedValue('Response');

      await ceoAgent.chat('user-123', 'New question', 'business-123');

      const chatCall = mockSmartInference.chat.mock.calls[0][0];
      expect(chatCall.length).toBeGreaterThan(2); // system + recent + new message
    });
  });

  describe('createWeeklyPlan', () => {
    it('should create weekly plan and save to SQL and memory', async () => {
      const businessData = {
        id: 'business-123',
        type: 'SaaS',
        industry: 'Tech',
        stage: 'Early',
      };

      const mockPlan = 'Weekly Plan:\n1. Goal 1\n2. Goal 2';

      mockSmartSQL.select.mockResolvedValue([businessData]);
      mockSmartMemory.read.mockResolvedValue([]);
      mockSmartInference.infer.mockResolvedValue(mockPlan);
      mockSmartSQL.insert.mockResolvedValue({ id: 'plan-123' });
      mockSmartMemory.append.mockResolvedValue(undefined);

      const result = await ceoAgent.createWeeklyPlan('user-123', 'business-123');

      expect(mockSmartInference.infer).toHaveBeenCalled();
      expect(mockSmartSQL.insert).toHaveBeenCalledWith(
        'weekly_plans',
        expect.objectContaining({
          userId: 'user-123',
          businessId: 'business-123',
          plan: mockPlan,
        })
      );
      expect(mockSmartMemory.append).toHaveBeenCalledWith(
        'ceo:weekly_plans',
        'user-123',
        expect.objectContaining({
          businessId: 'business-123',
          plan: mockPlan,
        })
      );
      expect(result.plan).toBe(mockPlan);
      expect(result.saved).toBe(true);
    });

    it('should include previous plans in context', async () => {
      const previousPlans = [
        { week: '2024-01-01', plan: 'Previous plan 1' },
        { week: '2024-01-08', plan: 'Previous plan 2' },
      ];

      mockSmartSQL.select.mockResolvedValue([{ type: 'SaaS' }]);
      mockSmartMemory.read.mockResolvedValue(previousPlans);
      mockSmartInference.infer.mockResolvedValue('New plan');

      await ceoAgent.createWeeklyPlan('user-123', 'business-123');

      const inferCall = mockSmartInference.infer.mock.calls[0][0];
      expect(inferCall).toContain('Previous Plans Context');
    });
  });
});

