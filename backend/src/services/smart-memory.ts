import { SmartMemory as LiquidMetalSmartMemory } from '@raindrop-studios/liquidmetal-smartcomponents';

export class SmartMemory {
  private client: LiquidMetalSmartMemory;
  private memoryStore: Map<string, any>;

  constructor() {
    this.client = new LiquidMetalSmartMemory({
      apiKey: process.env.RAINDROP_API_KEY || '',
      endpoint: process.env.RAINDROP_MEMORY_ENDPOINT || 'https://api.raindrop.io/memory',
    });
    this.memoryStore = new Map();
  }

  async read(key: string, userId: string): Promise<any> {
    try {
      const memoryKey = `${userId}:${key}`;
      
      // Try LiquidMetal first
      const result = await this.client.read({
        key: memoryKey,
        userId,
      });

      if (result) {
        return result;
      }

      // Fallback to local store
      return this.memoryStore.get(memoryKey) || null;
    } catch (error) {
      console.error('SmartMemory read error:', error);
      // Fallback to local store
      return this.memoryStore.get(`${userId}:${key}`) || null;
    }
  }

  async write(key: string, userId: string, value: any): Promise<void> {
    try {
      const memoryKey = `${userId}:${key}`;
      
      await this.client.write({
        key: memoryKey,
        userId,
        value,
      });

      // Also store locally as backup
      this.memoryStore.set(memoryKey, value);
    } catch (error) {
      console.error('SmartMemory write error:', error);
      // Fallback to local store
      this.memoryStore.set(`${userId}:${key}`, value);
    }
  }

  async append(key: string, userId: string, value: any): Promise<void> {
    try {
      const existing = (await this.read(key, userId)) || [];
      const updated = Array.isArray(existing) ? [...existing, value] : [existing, value];
      await this.write(key, userId, updated);
    } catch (error) {
      console.error('SmartMemory append error:', error);
      const memoryKey = `${userId}:${key}`;
      const existing = this.memoryStore.get(memoryKey);
      const updated = Array.isArray(existing) ? [...existing, value] : [existing, value];
      this.memoryStore.set(memoryKey, updated);
    }
  }

  async delete(key: string, userId: string): Promise<void> {
    try {
      const memoryKey = `${userId}:${key}`;
      await this.client.delete({
        key: memoryKey,
        userId,
      });
      this.memoryStore.delete(memoryKey);
    } catch (error) {
      console.error('SmartMemory delete error:', error);
      this.memoryStore.delete(`${userId}:${key}`);
    }
  }

  async list(userId: string, prefix?: string): Promise<string[]> {
    try {
      const result = await this.client.list({
        userId,
        prefix,
      });
      return result || [];
    } catch (error) {
      console.error('SmartMemory list error:', error);
      // Fallback to local store
      const keys: string[] = [];
      const searchPrefix = prefix ? `${userId}:${prefix}` : `${userId}:`;
      for (const key of this.memoryStore.keys()) {
        if (key.startsWith(searchPrefix)) {
          keys.push(key.replace(`${userId}:`, ''));
        }
      }
      return keys;
    }
  }
}

