import { SmartBuckets as LiquidMetalSmartBuckets } from '@raindrop-studios/liquidmetal-smartcomponents';

export class SmartBuckets {
  private client: LiquidMetalSmartBuckets;
  private localStorage: Map<string, Map<string, any>>;

  constructor() {
    this.client = new LiquidMetalSmartBuckets({
      apiKey: process.env.RAINDROP_API_KEY || '',
      endpoint: process.env.RAINDROP_BUCKETS_ENDPOINT || 'https://api.raindrop.io/buckets',
    });
    this.localStorage = new Map();
  }

  async upload(bucket: string, key: string, data: any, metadata?: Record<string, any>): Promise<void> {
    try {
      await this.client.upload({
        bucket,
        key,
        data,
        metadata,
      });

      // Also store locally as backup
      if (!this.localStorage.has(bucket)) {
        this.localStorage.set(bucket, new Map());
      }
      this.localStorage.get(bucket)!.set(key, { data, metadata, timestamp: Date.now() });
    } catch (error) {
      console.error('SmartBuckets upload error:', error);
      // Fallback to local storage
      if (!this.localStorage.has(bucket)) {
        this.localStorage.set(bucket, new Map());
      }
      this.localStorage.get(bucket)!.set(key, { data, metadata, timestamp: Date.now() });
    }
  }

  async download(bucket: string, key: string): Promise<any> {
    try {
      const result = await this.client.download({
        bucket,
        key,
      });
      return result;
    } catch (error) {
      console.error('SmartBuckets download error:', error);
      // Fallback to local storage
      const bucketData = this.localStorage.get(bucket);
      if (bucketData) {
        const item = bucketData.get(key);
        return item ? item.data : null;
      }
      return null;
    }
  }

  async list(bucket: string, prefix?: string): Promise<string[]> {
    try {
      const result = await this.client.list({
        bucket,
        prefix,
      });
      return result || [];
    } catch (error) {
      console.error('SmartBuckets list error:', error);
      // Fallback to local storage
      const bucketData = this.localStorage.get(bucket);
      if (!bucketData) return [];
      
      const keys: string[] = [];
      for (const key of bucketData.keys()) {
        if (!prefix || key.startsWith(prefix)) {
          keys.push(key);
        }
      }
      return keys;
    }
  }

  async delete(bucket: string, key: string): Promise<void> {
    try {
      await this.client.delete({
        bucket,
        key,
      });
      
      // Also delete from local storage
      const bucketData = this.localStorage.get(bucket);
      if (bucketData) {
        bucketData.delete(key);
      }
    } catch (error) {
      console.error('SmartBuckets delete error:', error);
      // Fallback to local storage
      const bucketData = this.localStorage.get(bucket);
      if (bucketData) {
        bucketData.delete(key);
      }
    }
  }

  async getMetadata(bucket: string, key: string): Promise<Record<string, any> | null> {
    try {
      const result = await this.client.getMetadata({
        bucket,
        key,
      });
      return result;
    } catch (error) {
      console.error('SmartBuckets getMetadata error:', error);
      // Fallback to local storage
      const bucketData = this.localStorage.get(bucket);
      if (bucketData) {
        const item = bucketData.get(key);
        return item ? item.metadata : null;
      }
      return null;
    }
  }
}

