import { SmartInference } from '../smart-inference.js';

// Mock the LiquidMetal SmartInference
jest.mock('@raindrop-studios/liquidmetal-smartcomponents', () => ({
  SmartInference: jest.fn().mockImplementation(() => ({
    generate: jest.fn(),
    chat: jest.fn(),
  })),
}));

describe('SmartInference', () => {
  let smartInference: SmartInference;
  const mockVultrApiKey = 'test-api-key';
  const mockVultrEndpoint = 'https://api.vultr.com/v2/inference';

  beforeEach(() => {
    process.env.VULTR_API_KEY = mockVultrApiKey;
    process.env.VULTR_INFERENCE_ENDPOINT = mockVultrEndpoint;
    smartInference = new SmartInference();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('infer', () => {
    it('should call generate with correct parameters', async () => {
      const mockResponse = { text: 'Test response' };
      const mockClient = (smartInference as any).client;
      mockClient.generate = jest.fn().mockResolvedValue(mockResponse);

      const result = await smartInference.infer('Test prompt');

      expect(mockClient.generate).toHaveBeenCalledWith({
        prompt: 'Test prompt',
        model: 'llama-3.1-70b',
        temperature: 0.7,
        maxTokens: 2000,
      });
      expect(result).toBe('Test response');
    });

    it('should use custom options when provided', async () => {
      const mockResponse = { text: 'Custom response' };
      const mockClient = (smartInference as any).client;
      mockClient.generate = jest.fn().mockResolvedValue(mockResponse);

      await smartInference.infer('Test prompt', {
        model: 'custom-model',
        temperature: 0.5,
        maxTokens: 1000,
      });

      expect(mockClient.generate).toHaveBeenCalledWith({
        prompt: 'Test prompt',
        model: 'custom-model',
        temperature: 0.5,
        maxTokens: 1000,
      });
    });

    it('should handle errors gracefully', async () => {
      const mockClient = (smartInference as any).client;
      mockClient.generate = jest.fn().mockRejectedValue(new Error('API Error'));

      await expect(smartInference.infer('Test prompt')).rejects.toThrow('Inference failed');
    });

    it('should handle response with content field', async () => {
      const mockResponse = { content: 'Content response' };
      const mockClient = (smartInference as any).client;
      mockClient.generate = jest.fn().mockResolvedValue(mockResponse);

      const result = await smartInference.infer('Test prompt');

      expect(result).toBe('Content response');
    });
  });

  describe('chat', () => {
    it('should call chat with correct parameters', async () => {
      const mockResponse = { text: 'Chat response' };
      const mockClient = (smartInference as any).client;
      mockClient.chat = jest.fn().mockResolvedValue(mockResponse);

      const messages = [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there' },
      ];

      const result = await smartInference.chat(messages);

      expect(mockClient.chat).toHaveBeenCalledWith({
        messages,
        model: 'llama-3.1-70b',
        temperature: 0.7,
      });
      expect(result).toBe('Chat response');
    });

    it('should handle errors gracefully', async () => {
      const mockClient = (smartInference as any).client;
      mockClient.chat = jest.fn().mockRejectedValue(new Error('Chat Error'));

      await expect(
        smartInference.chat([{ role: 'user', content: 'Test' }])
      ).rejects.toThrow('Chat inference failed');
    });
  });
});

