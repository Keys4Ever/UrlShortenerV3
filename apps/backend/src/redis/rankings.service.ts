import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from '../urls/entities/url.entity';
import { RedisService } from './redis.service';

@Injectable()
export class RankingsService {
  private readonly logger = new Logger(RankingsService.name);

  constructor(
    @InjectRepository(Url)
    private urlsRepository: Repository<Url>,
    private redisService: RedisService,
  ) {}

  @Cron('*/5 * * * *')
  async syncTopUrlsToRedis(): Promise<void> {
    try {
      const topUrls = await this.urlsRepository
        .createQueryBuilder('url')
        .select('url.shortCode', 'shortCode')
        .addSelect('url.clickCount', 'clickCount')
        .where('url.isDeleted = false')
        .orderBy('url.clickCount', 'DESC')
        .limit(100)
        .getRawMany();

      const client = this.redisService.getClient();
      const rankingKey = 'top_urls:ranking';

      await client.del(rankingKey);

      for (const url of topUrls) {
        await client.zAdd(rankingKey, {
          score: parseInt(url.clickCount),
          value: url.shortCode,
        });
      }

      this.logger.debug(`Synced ${topUrls.length} top URLs to Redis`);
    } catch (error) {
      this.logger.error('Error syncing top URLs to Redis:', error);
    }
  }

  @Cron('0 2 * * *')
  async cleanupOldStats(): Promise<void> {
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      this.logger.debug(
        `Cleanup job: Would delete stats older than ${ninetyDaysAgo.toISOString()}`,
      );
    } catch (error) {
      this.logger.error('Error cleaning up old stats:', error);
    }
  }

  async getTopUrls(limit = 100): Promise<string[]> {
    return this.redisService.getTopUrls(limit);
  }
}
