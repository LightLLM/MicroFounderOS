import { ProductAgent } from '../product-agent.js';
import { SmartInference } from '../../services/smart-inference.js';
import { SmartMemory } from '../../services/smart-memory.js';
import { SmartBuckets } from '../../services/smart-buckets.js';

describe('ProductAgent', () => {
  let productAgent: ProductAgent;
  let mockSmartInference: jest.Mocked<SmartInference>;
  let mockSmartMemory: jest.Mocked<SmartMemory>;
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

    mockSmartBuckets = {
      upload: jest.fn(),
      download: jest.fn(),
      list: jest.fn(),
      delete: jest.fn(),
      getMetadata: jest.fn(),
    } as any;

    productAgent = new ProductAgent(mockSmartInference, mockSmartMemory, mockSmartBuckets);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('chat', () => {
    it('should chat with user and return response', async () => {
      mockSmartMemory.read.mockResolvedValue({});
      mockSmartInference.chat.mockResolvedValue('Here is your product advice...');

      const result = await productAgent.chat('user-123', 'Help with UX', 'business-123');

      expect(mockSmartInference.chat).toHaveBeenCalled();
      expect(result.response).toBe('Here is your product advice...');
      expect(result.agentId).toBe('product');
    });
  });

  describe('createPRD', () => {
    it('should create PRD and save to buckets', async () => {
      const mockPRD = '# PRD\n\n## Executive Summary\n...';

      mockSmartMemory.read.mockResolvedValue({});
      mockSmartInference.infer.mockResolvedValue(mockPRD);
      mockSmartBuckets.upload.mockResolvedValue(undefined);
      mockSmartMemory.append.mockResolvedValue(undefined);

      const result = await productAgent.createPRD('user-123', 'business-123', 'New Feature');

      expect(mockSmartInference.infer).toHaveBeenCalled();
      expect(mockSmartBuckets.upload).toHaveBeenCalledWith(
        'product-docs',
        expect.stringContaining('prds'),
        mockPRD,
        expect.objectContaining({
          type: 'prd',
          feature: 'New Feature',
        })
      );
      expect(result.prd).toBe(mockPRD);
      expect(result.saved).toBe(true);
    });
  });
});

