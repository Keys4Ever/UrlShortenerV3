import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { Url } from './entities/url.entity';
import { UrlStat, DeviceType } from './entities/url-stat.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { Tag } from '../tags/entities/tag.entity';
import { RedisService } from '../redis/redis.service';
import { v4 as uuid } from 'uuid';
import * as geoip from 'geoip-lite';
import * as UAParser from 'ua-parser-js';

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(Url)
    private urlsRepository: Repository<Url>,
    @InjectRepository(UrlStat)
    private urlStatsRepository: Repository<UrlStat>,
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
    private redisService: RedisService,
  ) {}

  private generateShortCode(): string {
    const uuid_part = uuid().replace(/-/g, '').substring(0, 8);
    const base62_chars =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let shortCode = '';
    let num = parseInt(uuid_part, 16);

    do {
      shortCode = base62_chars[num % 62] + shortCode;
      num = Math.floor(num / 62);
    } while (num > 0);

    while (shortCode.length < 6) {
      shortCode = base62_chars[Math.floor(Math.random() * 62)] + shortCode;
    }

    return shortCode;
  }

  async create(userId: number, createUrlDto: CreateUrlDto): Promise<Url> {
    let shortCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      shortCode = this.generateShortCode();
      const existing = await this.urlsRepository.findOne({
        where: { shortCode },
      });
      if (!existing) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts === maxAttempts) {
      throw new BadRequestException('Failed to generate unique short code');
    }

    const url = this.urlsRepository.create({
      originalUrl: createUrlDto.originalUrl,
      shortCode,
      title: createUrlDto.title,
      description: createUrlDto.description,
      user: { id: userId },
    });

    if (createUrlDto.tags && createUrlDto.tags.length > 0) {
      const tags = await Promise.all(
        createUrlDto.tags.map((tagName) => this.getOrCreateTag(tagName)),
      );
      url.tags = tags;
    }

    await this.urlsRepository.save(url);

    await this.redisService.incrementUrlClicks(shortCode, userId);

    return url;
  }

  async getUserUrls(
    userId: number,
    skip = 0,
    take = 20,
  ): Promise<{ urls: Url[]; total: number }> {
    const [urls, total] = await this.urlsRepository.findAndCount({
      where: { user: { id: userId }, isDeleted: false },
      relations: ['tags', 'stats'],
      skip,
      take,
      order: { createdAt: 'DESC' },
    });

    return { urls, total };
  }

  async resolveShortCode(
    shortCode: string,
    userAgent?: string,
    ip?: string,
    referrer?: string,
  ): Promise<Url> {
    const url = await this.urlsRepository.findOne({
      where: { shortCode, isDeleted: false },
    });

    if (!url) {
      throw new NotFoundException(`URL with short code ${shortCode} not found`);
    }

    this.recordClickAsync(url.id, shortCode, userAgent, ip, referrer).catch((err) =>
      console.error('Error recording click:', err),
    );

    url.clickCount += 1;
    await this.urlsRepository.update(
      { id: url.id },
      { clickCount: url.clickCount },
    );
    await this.redisService.incrementUrlClicks(shortCode);
    await this.redisService.clearUrlStatsCache(shortCode);

    return url;
  }

  private async recordClickAsync(
    urlId: number,
    shortCode: string,
    userAgent?: string,
    ip?: string,
    referrer?: string,
  ): Promise<void> {
    try {
      let deviceType = DeviceType.UNKNOWN;
      let country = 'UN';
      const utmParams: any = {};

      if (userAgent) {
        const parser = new UAParser.UAParser(userAgent);
        const deviceInfo = parser.getDevice();
        const browserInfo = parser.getBrowser();

        if (
          browserInfo.name &&
          browserInfo.name.toLowerCase().includes('bot')
        ) {
          deviceType = DeviceType.BOT;
        } else if (deviceInfo.type === 'mobile') {
          deviceType = DeviceType.MOBILE;
        } else if (deviceInfo.type === 'tablet') {
          deviceType = DeviceType.TABLET;
        } else {
          deviceType = DeviceType.DESKTOP;
        }
      }

      if (ip && ip !== '::1' && ip !== '127.0.0.1') {
        const geo = geoip.lookup(ip);
        if (geo) {
          country = geo.country;
        }
      }

      if (referrer) {
        try {
          const url = new URL(referrer);
          utmParams.source = url.searchParams.get('utm_source');
          utmParams.medium = url.searchParams.get('utm_medium');
          utmParams.campaign = url.searchParams.get('utm_campaign');
          utmParams.content = url.searchParams.get('utm_content');
          utmParams.term = url.searchParams.get('utm_term');
        } catch {
        }
      }

      const stat = this.urlStatsRepository.create({
        urlId,
        deviceType,
        country,
        ip,
        referrer,
        userAgent,
        utmParams: Object.keys(utmParams).length > 0 ? utmParams : undefined,
      });

      await this.urlStatsRepository.save(stat);
    } catch (error) {
      console.error('Error recording click stats:', error);
    } finally {
      await this.redisService.clearUrlStatsCache(shortCode);
    }
  }

  async getUrlStats(urlId: number, userId?: number): Promise<any> {
    const url = await this.urlsRepository.findOne({
      where: { id: urlId, isDeleted: false },
      relations: ['user'],
    });
    if (!url) {
      throw new NotFoundException(`URL with ID ${urlId} not found`);
    }

    if (userId != null && url.user?.id !== userId) {
      throw new NotFoundException(`URL with ID ${urlId} not found or access denied`);
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const totalClicks = url.clickCount;
    const clicksLast24h = await this.urlStatsRepository.count({
      where: {
        urlId,
        createdAt: MoreThanOrEqual(twentyFourHoursAgo),
      },
    });

    const deviceBreakdown = await this.urlStatsRepository
      .createQueryBuilder('stat')
      .select('stat.deviceType', 'deviceType')
      .addSelect('COUNT(*)', 'count')
      .where('stat.urlId = :urlId', { urlId })
      .groupBy('stat.deviceType')
      .getRawMany();

    const countryBreakdown = await this.urlStatsRepository
      .createQueryBuilder('stat')
      .select("COALESCE(stat.country, 'UN')", 'country')
      .addSelect('COUNT(*)', 'count')
      .where('stat.urlId = :urlId', { urlId })
      .groupBy("COALESCE(stat.country, 'UN')")
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topReferrers = await this.urlStatsRepository
      .createQueryBuilder('stat')
      .select('stat.referrer', 'referrer')
      .addSelect('COUNT(*)', 'count')
      .where('stat.urlId = :urlId', { urlId })
      .andWhere('stat.referrer IS NOT NULL')
      .groupBy('stat.referrer')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const stats = {
      totalClicks,
      clicksLast24h,
      deviceBreakdown: deviceBreakdown.map((d) => ({
        type: d.deviceType,
        count: parseInt(d.count),
      })),
      countryBreakdown: countryBreakdown.map((c) => ({
        country: c.country,
        count: parseInt(c.count),
      })),
      topReferrers: topReferrers.map((r) => ({
        referrer: r.referrer,
        count: parseInt(r.count),
      })),
    };

    return stats;
  }

  async update(
    userId: number,
    urlId: number,
    updateUrlDto: UpdateUrlDto,
  ): Promise<Url> {
    const url = await this.urlsRepository.findOne({
      where: { id: urlId },
      relations: ['user', 'tags'],
    });

    if (!url) {
      throw new NotFoundException(`URL with ID ${urlId} not found`);
    }

    if (url.user?.id !== userId) {
      throw new BadRequestException('Not authorized to update this URL');
    }

    if (updateUrlDto.originalUrl !== undefined) {
      url.originalUrl = updateUrlDto.originalUrl;
    }
    if (updateUrlDto.title !== undefined) {
      url.title = updateUrlDto.title;
    }
    if (updateUrlDto.description !== undefined) {
      url.description = updateUrlDto.description;
    }

    if (updateUrlDto.tags !== undefined) {
      const tags = await Promise.all(
        updateUrlDto.tags.map((tagName) => this.getOrCreateTag(tagName)),
      );
      url.tags = tags;
    }

    const saved = await this.urlsRepository.save(url);
    await this.redisService.clearUrlCache(url.shortCode);
    return saved;
  }

  async delete(userId: number, urlId: number): Promise<void> {
    const url = await this.urlsRepository.findOne({
      where: { id: urlId },
      relations: ['user'],
    });

    if (!url) {
      throw new NotFoundException(`URL with ID ${urlId} not found`);
    }

    if (url.user?.id !== userId) {
      throw new BadRequestException('Not authorized to delete this URL');
    }

    await this.urlsRepository.update({ id: urlId }, { isDeleted: true });
    await this.redisService.clearUrlCache(url.shortCode);
  }

  private async getOrCreateTag(name: string): Promise<Tag> {
    let tag = await this.tagsRepository.findOne({ where: { name } });
    if (!tag) {
      tag = this.tagsRepository.create({ name });
      await this.tagsRepository.save(tag);
    }
    return tag;
  }

  async getUrlsByTag(userId: number, tagName: string): Promise<Url[]> {
    return this.urlsRepository
      .createQueryBuilder('url')
      .innerJoinAndSelect('url.tags', 'tag', 'tag.name = :tagName', {
        tagName,
      })
      .where('url.user.id = :userId', { userId })
      .andWhere('url.isDeleted = false')
      .getMany();
  }
}
