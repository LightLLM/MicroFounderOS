import { MarketingAgent } from '../marketing-agent.js';
import { SmartInference } from '../../services/smart-inference.js';
import { SmartMemory } from '../../services/smart-memory.js';
import { SmartBuckets } from '../../services/smart-buckets.js';

describe('MarketingAgent', () => {
  let marketingAgent: MarketingAgent;
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

    marketingAgent = new MarketingAgent(mockSmartInference, mockSmartMemory, mockSmartBuckets);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('chat', () => {
    it('should chat with user and return response', async () => {
      mockSmartMemory.read.mockResolvedValue({});
      mockSmartInference.chat.mockResolvedValue('Here is your marketing advice...');

      const result = await marketingAgent.chat('user-123', 'Help with ads', 'business-123');

      expect(mockSmartInference.chat).toHaveBeenCalled();
      expect(result.response).toBe('Here is your marketing advice...');
      expect(result.agentId).toBe('marketing');
    });

    it('should save conversation to memory', async () => {
      mockSmartMemory.read.mockResolvedValue({});
      mockSmartInference.chat.mockResolvedValue('Response');

      await marketingAgent.chat('user-123', 'Test message', 'business-123');

      expect(mockSmartMemory.append).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateAssets', () => {
    it('should generate ad copy and save to buckets', async () => {
      const mockAdCopy = JSON.stringify({
        short: 'Short ad copy',
        medium: 'Medium ad copy',
        long: 'Long ad copy',
      });

      mockSmartMemory.read.mockResolvedValue({ type: 'SaaS' });
      mockSmartInference.infer.mockResolvedValue(mockAdCopy);
      mockSmartBuckets.upload.mockResolvedValue(undefined);
      mockSmartMemory.append.mockResolvedValue(undefined);

      const result = await marketingAgent.generateAssets('user-123', 'business-123', 'ad_copy');

      expect(mockSmartInference.infer).toHaveBeenCalled();
      expect(mockSmartBuckets.upload).toHaveBeenCalledWith(
        'marketing-assets',
        expect.stringContaining('ad_copy'),
        mockAdCopy,
        expect.objectContaining({
          assetType: 'ad_copy',
          businessId: 'business-123',
        })
      );
      expect(result.assets).toHaveLength(1);
      expect(result.saved).toBe(true);
    });

    it('should generate landing page and save to buckets', async () => {
      const mockLandingPage = '<html><body>Landing Page</body></html>';

      mockSmartMemory.read.mockResolvedValue({ type: 'SaaS' });
      mockSmartInference.infer.mockResolvedValue(mockLandingPage);
      mockSmartBuckets.upload.mockResolvedValue(undefined);
      mockSmartMemory.append.mockResolvedValue(undefined);

      const result = await marketingAgent.generateAssets(
        'user-123',
        'business-123',
        'landing_page'
      );

      expect(mockSmartInference.infer).toHaveBeenCalled();
      expect(mockSmartBuckets.upload).toHaveBeenCalledWith(
        'marketing-assets',
        expect.stringContaining('landing_page'),
        mockLandingPage,
        expect.objectContaining({
          assetType: 'landing_page',
        })
      );
      expect(result.assets[0].format).toBe('html');
    });

    it('should generate email campaign and save to buckets', async () => {
      const mockEmailCampaign = JSON.stringify({
        welcome: { subject: 'Welcome', body: 'Welcome email' },
        educational: { subject: 'Learn', body: 'Educational email' },
        conversion: { subject: 'Buy', body: 'Conversion email' },
      });

      mockSmartMemory.read.mockResolvedValue({ type: 'SaaS' });
      mockSmartInference.infer.mockResolvedValue(mockEmailCampaign);
      mockSmartBuckets.upload.mockResolvedValue(undefined);
      mockSmartMemory.append.mockResolvedValue(undefined);

      const result = await marketingAgent.generateAssets(
        'user-123',
        'business-123',
        'email_campaign'
      );

      expect(mockSmartInference.infer).toHaveBeenCalled();
      expect(result.assets[0].format).toBe('json');
    });
  });
});

