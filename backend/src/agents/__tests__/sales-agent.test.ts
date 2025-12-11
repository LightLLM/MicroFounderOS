import { SalesAgent } from '../sales-agent.js';
import { SmartInference } from '../../services/smart-inference.js';
import { SmartMemory } from '../../services/smart-memory.js';

describe('SalesAgent', () => {
  let salesAgent: SalesAgent;
  let mockSmartInference: jest.Mocked<SmartInference>;
  let mockSmartMemory: jest.Mocked<SmartMemory>;

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

    salesAgent = new SalesAgent(mockSmartInference, mockSmartMemory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('chat', () => {
    it('should chat with user and return response', async () => {
      mockSmartMemory.read
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});
      mockSmartInference.chat.mockResolvedValue('Here is your sales advice...');

      const result = await salesAgent.chat('user-123', 'Help with outreach', 'business-123');

      expect(mockSmartInference.chat).toHaveBeenCalled();
      expect(result.response).toBe('Here is your sales advice...');
      expect(result.agentId).toBe('sales');
    });
  });

  describe('generateOutreachMessage', () => {
    it('should generate outreach message and save to memory', async () => {
      const prospectInfo = {
        name: 'John Doe',
        company: 'Acme Corp',
        role: 'CEO',
      };

      const mockMessage = 'Hi John,\n\nI noticed Acme Corp...';

      mockSmartMemory.read.mockResolvedValue({ type: 'SaaS' });
      mockSmartInference.infer.mockResolvedValue(mockMessage);
      mockSmartMemory.append.mockResolvedValue(undefined);

      const result = await salesAgent.generateOutreachMessage(
        'user-123',
        'business-123',
        prospectInfo
      );

      expect(mockSmartInference.infer).toHaveBeenCalled();
      expect(mockSmartMemory.append).toHaveBeenCalledWith(
        'sales:outreach_messages',
        'user-123',
        expect.objectContaining({
          prospectInfo,
          message: mockMessage,
        })
      );
      expect(result.message).toBe(mockMessage);
      expect(result.saved).toBe(true);
    });
  });
});

