import { FinanceAgent } from '../finance-agent.js';
import { SmartInference } from '../../services/smart-inference.js';
import { SmartMemory } from '../../services/smart-memory.js';
import { SmartSQL } from '../../services/smart-sql.js';

describe('FinanceAgent', () => {
  let financeAgent: FinanceAgent;
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

    financeAgent = new FinanceAgent(mockSmartInference, mockSmartMemory, mockSmartSQL);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('chat', () => {
    it('should chat with user and return response', async () => {
      mockSmartSQL.select.mockResolvedValue([{ type: 'SaaS', revenueModel: 'Subscription' }]);
      mockSmartSQL.select.mockResolvedValueOnce([{ type: 'SaaS' }]);
      mockSmartSQL.select.mockResolvedValueOnce([]);
      mockSmartInference.chat.mockResolvedValue('Here is your financial advice...');

      const result = await financeAgent.chat('user-123', 'Help with pricing', 'business-123');

      expect(mockSmartInference.chat).toHaveBeenCalled();
      expect(result.response).toBe('Here is your financial advice...');
      expect(result.agentId).toBe('finance');
    });
  });

  describe('runForecast', () => {
    it('should run forecast and save to SQL and memory', async () => {
      const businessData = {
        id: 'business-123',
        type: 'SaaS',
        revenueModel: 'Subscription',
        currentRevenue: 10000,
        currentExpenses: 5000,
      };

      const mockForecast = JSON.stringify({
        months: [
          { month: '2024-01', revenue: 10000, expenses: 5000 },
          { month: '2024-02', revenue: 12000, expenses: 5500 },
        ],
      });

      mockSmartSQL.select
        .mockResolvedValueOnce([businessData])
        .mockResolvedValueOnce([]);
      mockSmartInference.infer.mockResolvedValue(mockForecast);
      mockSmartSQL.insert.mockResolvedValue({ id: 'forecast-123' });
      mockSmartMemory.write.mockResolvedValue(undefined);

      const result = await financeAgent.runForecast('user-123', 'business-123');

      expect(mockSmartInference.infer).toHaveBeenCalled();
      expect(mockSmartSQL.insert).toHaveBeenCalledWith(
        'forecasts',
        expect.objectContaining({
          userId: 'user-123',
          businessId: 'business-123',
          period: '12_months',
        })
      );
      expect(mockSmartMemory.write).toHaveBeenCalledWith(
        'finance:latest_forecast',
        'user-123',
        expect.objectContaining({
          businessId: 'business-123',
        })
      );
      expect(result.saved).toBe(true);
    });

    it('should handle non-JSON forecast response', async () => {
      mockSmartSQL.select
        .mockResolvedValueOnce([{ type: 'SaaS' }])
        .mockResolvedValueOnce([]);
      mockSmartInference.infer.mockResolvedValue('Plain text forecast');
      mockSmartSQL.insert.mockResolvedValue({ id: 'forecast-123' });

      const result = await financeAgent.runForecast('user-123', 'business-123');

      expect(result.forecast.parsed).toBe(false);
      expect(result.forecast.text).toBe('Plain text forecast');
    });
  });
});

