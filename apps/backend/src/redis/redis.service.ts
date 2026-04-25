import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private isConnected = false;

  async onModuleInit() {
    console.log('Processing env vars:', process.env);
    
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379');
    const password = process.env.REDIS_PASSWORD || undefined;
    
    console.log(`Attempting Redis connection to ${host}:${port}`);
    
    this.client = createClient({
      socket: {
        host: host,
        port: port,
      },
      password: password,
    });

    this.client.on('error', (err) => console.error('Redis Client Error:', err));
    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('✅ Redis connected successfully');
    });

    try {
      await this.client.connect();
      console.log('✅ Redis connection established');
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  async incrementUrlClicks(shortCode: string, userId?: number): Promise<void> {
    try {
      const key = `url:clicks:${shortCode}`;
      await this.client.incr(key);
      await this.client.expire(key, 86400 * 30);

      const rankingKey = 'top_urls:ranking';
      await this.client.zIncrBy(rankingKey, 1, shortCode);

      const count = await this.client.zCard(rankingKey);
      if (count > 100) {
        await this.client.zRemRangeByRank(rankingKey, 0, count - 101);
      }
    } catch (error) {
      console.error('Error incrementing URL clicks in Redis:', error);
    }
  }

  async getTopUrls(limit = 100): Promise<string[]> {
    try {
      const rankingKey = 'top_urls:ranking';
      const results = await this.client.zRange(rankingKey, 0, limit - 1, {
        REV: true,
      });
      return results;
    } catch (error) {
      console.error('Error getting top URLs from Redis:', error);
      return [];
    }
  }

  async getUrlClicksFromCache(shortCode: string): Promise<number> {
    try {
      const key = `url:clicks:${shortCode}`;
      const count = await this.client.get(key);
      return count ? parseInt(count) : 0;
    } catch (error) {
      console.error('Error getting URL clicks from cache:', error);
      return 0;
    }
  }

  async cacheUrlStats(
    shortCode: string,
    stats: Record<string, any>,
    ttl = 3600,
  ): Promise<void> {
    try {
      const key = `url:stats:${shortCode}`;
      await this.client.setEx(key, ttl, JSON.stringify(stats));
    } catch (error) {
      console.error('Error caching URL stats:', error);
    }
  }

  async getCachedStats(shortCode: string): Promise<Record<string, any> | null> {
    try {
      const key = `url:stats:${shortCode}`;
      const cached = await this.client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached stats:', error);
      return null;
    }
  }

  async clearUrlStatsCache(shortCode: string): Promise<void> {
    try {
      await this.client.del(`url:stats:${shortCode}`);
    } catch (error) {
      console.error('Error clearing URL stats cache:', error);
    }
  }

  async clearUrlCache(shortCode: string): Promise<void> {
    try {
      const keys = await this.client.keys(`url:*:${shortCode}`);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Error clearing URL cache:', error);
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }
}
