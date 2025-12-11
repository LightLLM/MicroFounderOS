import { SmartMemory } from '../smart-memory.js';

// Mock the LiquidMetal SmartMemory
jest.mock('@raindrop-studios/liquidmetal-smartcomponents', () => ({
  SmartMemory: jest.fn().mockImplementation(() => ({
    read: jest.fn(),
    write: jest.fn(),
    delete: jest.fn(),
    list: jest.fn(),
  })),
}));

describe('SmartMemory', () => {
  let smartMemory: SmartMemory;
  const mockApiKey = 'test-api-key';
  const mockEndpoint = 'https://api.raindrop.io/memory';

  beforeEach(() => {
    process.env.RAINDROP_API_KEY = mockApiKey;
    process.env.RAINDROP_MEMORY_ENDPOINT = mockEndpoint;
    smartMemory = new SmartMemory();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('read', () => {
    it('should read from client and return value', async () => {
      const mockValue = { data: 'test' };
      const mockClient = (smartMemory as any).client;
      mockClient.read = jest.fn().mockResolvedValue(mockValue);

      const result = await smartMemory.read('test-key', 'user-123');

      expect(mockClient.read).toHaveBeenCalledWith({
        key: 'user-123:test-key',
        userId: 'user-123',
      });
      expect(result).toEqual(mockValue);
    });

    it('should fallback to local store when client fails', async () => {
      const mockClient = (smartMemory as any).client;
      mockClient.read = jest.fn().mockRejectedValue(new Error('API Error'));

      const localValue = { data: 'local' };
      (smartMemory as any).memoryStore.set('user-123:test-key', localValue);

      const result = await smartMemory.read('test-key', 'user-123');

      expect(result).toEqual(localValue);
    });

    it('should return null when key does not exist', async () => {
      const mockClient = (smartMemory as any).client;
      mockClient.read = jest.fn().mockResolvedValue(null);

      const result = await smartMemory.read('non-existent', 'user-123');

      expect(result).toBeNull();
    });
  });

  describe('write', () => {
    it('should write to client and local store', async () => {
      const mockClient = (smartMemory as any).client;
      mockClient.write = jest.fn().mockResolvedValue(undefined);

      const value = { data: 'test' };
      await smartMemory.write('test-key', 'user-123', value);

      expect(mockClient.write).toHaveBeenCalledWith({
        key: 'user-123:test-key',
        userId: 'user-123',
        value,
      });
      expect((smartMemory as any).memoryStore.get('user-123:test-key')).toEqual(value);
    });

    it('should fallback to local store when client fails', async () => {
      const mockClient = (smartMemory as any).client;
      mockClient.write = jest.fn().mockRejectedValue(new Error('API Error'));

      const value = { data: 'test' };
      await smartMemory.write('test-key', 'user-123', value);

      expect((smartMemory as any).memoryStore.get('user-123:test-key')).toEqual(value);
    });
  });

  describe('append', () => {
    it('should append to existing array', async () => {
      const existing = [{ id: 1 }];
      const newItem = { id: 2 };

      jest.spyOn(smartMemory, 'read').mockResolvedValue(existing);
      jest.spyOn(smartMemory, 'write').mockResolvedValue(undefined);

      await smartMemory.append('test-key', 'user-123', newItem);

      expect(smartMemory.write).toHaveBeenCalledWith('test-key', 'user-123', [
        ...existing,
        newItem,
      ]);
    });

    it('should create array if value does not exist', async () => {
      jest.spyOn(smartMemory, 'read').mockResolvedValue(null);
      jest.spyOn(smartMemory, 'write').mockResolvedValue(undefined);

      const newItem = { id: 1 };
      await smartMemory.append('test-key', 'user-123', newItem);

      expect(smartMemory.write).toHaveBeenCalledWith('test-key', 'user-123', [newItem]);
    });
  });

  describe('delete', () => {
    it('should delete from client and local store', async () => {
      const mockClient = (smartMemory as any).client;
      mockClient.delete = jest.fn().mockResolvedValue(undefined);

      (smartMemory as any).memoryStore.set('user-123:test-key', { data: 'test' });

      await smartMemory.delete('test-key', 'user-123');

      expect(mockClient.delete).toHaveBeenCalledWith({
        key: 'user-123:test-key',
        userId: 'user-123',
      });
      expect((smartMemory as any).memoryStore.has('user-123:test-key')).toBe(false);
    });
  });

  describe('list', () => {
    it('should list keys from client', async () => {
      const mockKeys = ['key1', 'key2'];
      const mockClient = (smartMemory as any).client;
      mockClient.list = jest.fn().mockResolvedValue(mockKeys);

      const result = await smartMemory.list('user-123');

      expect(mockClient.list).toHaveBeenCalledWith({
        userId: 'user-123',
        prefix: undefined,
      });
      expect(result).toEqual(mockKeys);
    });

    it('should filter by prefix', async () => {
      const mockKeys = ['prefix:key1'];
      const mockClient = (smartMemory as any).client;
      mockClient.list = jest.fn().mockResolvedValue(mockKeys);

      const result = await smartMemory.list('user-123', 'prefix');

      expect(mockClient.list).toHaveBeenCalledWith({
        userId: 'user-123',
        prefix: 'prefix',
      });
      expect(result).toEqual(mockKeys);
    });

    it('should fallback to local store when client fails', async () => {
      const mockClient = (smartMemory as any).client;
      mockClient.list = jest.fn().mockRejectedValue(new Error('API Error'));

      (smartMemory as any).memoryStore.set('user-123:key1', {});
      (smartMemory as any).memoryStore.set('user-123:key2', {});
      (smartMemory as any).memoryStore.set('other-user:key3', {});

      const result = await smartMemory.list('user-123');

      expect(result).toContain('key1');
      expect(result).toContain('key2');
      expect(result).not.toContain('key3');
    });
  });
});

