import { SmartBuckets } from '../smart-buckets.js';

// Mock the LiquidMetal SmartBuckets
jest.mock('@raindrop-studios/liquidmetal-smartcomponents', () => ({
  SmartBuckets: jest.fn().mockImplementation(() => ({
    upload: jest.fn(),
    download: jest.fn(),
    list: jest.fn(),
    delete: jest.fn(),
    getMetadata: jest.fn(),
  })),
}));

describe('SmartBuckets', () => {
  let smartBuckets: SmartBuckets;
  const mockApiKey = 'test-api-key';
  const mockEndpoint = 'https://api.raindrop.io/buckets';

  beforeEach(() => {
    process.env.RAINDROP_API_KEY = mockApiKey;
    process.env.RAINDROP_BUCKETS_ENDPOINT = mockEndpoint;
    smartBuckets = new SmartBuckets();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('should upload to client and local storage', async () => {
      const mockClient = (smartBuckets as any).client;
      mockClient.upload = jest.fn().mockResolvedValue(undefined);

      const data = { content: 'test' };
      const metadata = { type: 'document' };

      await smartBuckets.upload('test-bucket', 'test-key', data, metadata);

      expect(mockClient.upload).toHaveBeenCalledWith({
        bucket: 'test-bucket',
        key: 'test-key',
        data,
        metadata,
      });

      const localData = (smartBuckets as any).localStorage.get('test-bucket');
      expect(localData.get('test-key').data).toEqual(data);
      expect(localData.get('test-key').metadata).toEqual(metadata);
    });

    it('should fallback to local storage on error', async () => {
      const mockClient = (smartBuckets as any).client;
      mockClient.upload = jest.fn().mockRejectedValue(new Error('API Error'));

      const data = { content: 'test' };
      await smartBuckets.upload('test-bucket', 'test-key', data);

      const localData = (smartBuckets as any).localStorage.get('test-bucket');
      expect(localData.get('test-key').data).toEqual(data);
    });
  });

  describe('download', () => {
    it('should download from client', async () => {
      const mockData = { content: 'test' };
      const mockClient = (smartBuckets as any).client;
      mockClient.download = jest.fn().mockResolvedValue(mockData);

      const result = await smartBuckets.download('test-bucket', 'test-key');

      expect(mockClient.download).toHaveBeenCalledWith({
        bucket: 'test-bucket',
        key: 'test-key',
      });
      expect(result).toEqual(mockData);
    });

    it('should fallback to local storage on error', async () => {
      const mockClient = (smartBuckets as any).client;
      mockClient.download = jest.fn().mockRejectedValue(new Error('API Error'));

      const localData = { content: 'local' };
      (smartBuckets as any).localStorage.set('test-bucket', new Map([
        ['test-key', { data: localData }],
      ]));

      const result = await smartBuckets.download('test-bucket', 'test-key');

      expect(result).toEqual(localData);
    });

    it('should return null when key does not exist', async () => {
      const mockClient = (smartBuckets as any).client;
      mockClient.download = jest.fn().mockRejectedValue(new Error('Not found'));

      const result = await smartBuckets.download('test-bucket', 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('list', () => {
    it('should list keys from client', async () => {
      const mockKeys = ['key1', 'key2', 'key3'];
      const mockClient = (smartBuckets as any).client;
      mockClient.list = jest.fn().mockResolvedValue(mockKeys);

      const result = await smartBuckets.list('test-bucket');

      expect(mockClient.list).toHaveBeenCalledWith({
        bucket: 'test-bucket',
        prefix: undefined,
      });
      expect(result).toEqual(mockKeys);
    });

    it('should filter by prefix', async () => {
      const mockKeys = ['prefix/key1'];
      const mockClient = (smartBuckets as any).client;
      mockClient.list = jest.fn().mockResolvedValue(mockKeys);

      const result = await smartBuckets.list('test-bucket', 'prefix');

      expect(mockClient.list).toHaveBeenCalledWith({
        bucket: 'test-bucket',
        prefix: 'prefix',
      });
      expect(result).toEqual(mockKeys);
    });

    it('should fallback to local storage on error', async () => {
      const mockClient = (smartBuckets as any).client;
      mockClient.list = jest.fn().mockRejectedValue(new Error('API Error'));

      (smartBuckets as any).localStorage.set('test-bucket', new Map([
        ['key1', {}],
        ['key2', {}],
        ['prefix/key3', {}],
      ]));

      const result = await smartBuckets.list('test-bucket', 'prefix');

      expect(result).toEqual(['prefix/key3']);
    });
  });

  describe('delete', () => {
    it('should delete from client and local storage', async () => {
      const mockClient = (smartBuckets as any).client;
      mockClient.delete = jest.fn().mockResolvedValue(undefined);

      (smartBuckets as any).localStorage.set('test-bucket', new Map([
        ['test-key', { data: 'test' }],
      ]));

      await smartBuckets.delete('test-bucket', 'test-key');

      expect(mockClient.delete).toHaveBeenCalledWith({
        bucket: 'test-bucket',
        key: 'test-key',
      });

      const localData = (smartBuckets as any).localStorage.get('test-bucket');
      expect(localData.has('test-key')).toBe(false);
    });

    it('should fallback to local storage on error', async () => {
      const mockClient = (smartBuckets as any).client;
      mockClient.delete = jest.fn().mockRejectedValue(new Error('API Error'));

      (smartBuckets as any).localStorage.set('test-bucket', new Map([
        ['test-key', { data: 'test' }],
      ]));

      await smartBuckets.delete('test-bucket', 'test-key');

      const localData = (smartBuckets as any).localStorage.get('test-bucket');
      expect(localData.has('test-key')).toBe(false);
    });
  });

  describe('getMetadata', () => {
    it('should get metadata from client', async () => {
      const mockMetadata = { type: 'document', size: 1024 };
      const mockClient = (smartBuckets as any).client;
      mockClient.getMetadata = jest.fn().mockResolvedValue(mockMetadata);

      const result = await smartBuckets.getMetadata('test-bucket', 'test-key');

      expect(mockClient.getMetadata).toHaveBeenCalledWith({
        bucket: 'test-bucket',
        key: 'test-key',
      });
      expect(result).toEqual(mockMetadata);
    });

    it('should fallback to local storage on error', async () => {
      const mockClient = (smartBuckets as any).client;
      mockClient.getMetadata = jest.fn().mockRejectedValue(new Error('API Error'));

      const localMetadata = { type: 'document' };
      (smartBuckets as any).localStorage.set('test-bucket', new Map([
        ['test-key', { metadata: localMetadata }],
      ]));

      const result = await smartBuckets.getMetadata('test-bucket', 'test-key');

      expect(result).toEqual(localMetadata);
    });
  });
});

