import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from '../urls/entities/url.entity';
import { AnonymousSecret } from './entities/anonymous-secret.entity';
import { CreateAnonymousUrlDto } from './dto/create-anonymous-url.dto';
import { RedisService } from '../redis/redis.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AnonymousService {
  constructor(
    @InjectRepository(Url)
    private urlsRepository: Repository<Url>,
    @InjectRepository(AnonymousSecret)
    private secretsRepository: Repository<AnonymousSecret>,
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

  private generateSecret(): string {
    return uuid().replace(/-/g, '').substring(0, 32);
  }

  async create(createAnonymousUrlDto: CreateAnonymousUrlDto): Promise<{
    shortCode: string;
    secret: string;
    shortUrl: string;
  }> {
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

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    const url = this.urlsRepository.create({
      originalUrl: createAnonymousUrlDto.originalUrl,
      shortCode,
      title: createAnonymousUrlDto.title,
      description: createAnonymousUrlDto.description,
      user: null,
      expiresAt: expirationDate,
    });

    const savedUrl = await this.urlsRepository.save(url);

    const secret = this.generateSecret();
    const anonymousSecret = this.secretsRepository.create({
      secret,
      urlId: savedUrl.id,
      isClaimed: false,
    });

    await this.secretsRepository.save(anonymousSecret);

    await this.redisService.incrementUrlClicks(shortCode);

    return {
      shortCode,
      secret,
      shortUrl: `${process.env.SHORT_URL_BASE || 'http://localhost:3000'}/${shortCode}`,
    };
  }

  async claimSecret(userId: number, secret: string): Promise<Url> {
    const anonymousSecret = await this.secretsRepository.findOne({
      where: { secret },
      relations: ['url'],
    });

    if (!anonymousSecret) {
      throw new NotFoundException('Invalid secret');
    }

    if (anonymousSecret.isClaimed) {
      throw new BadRequestException('This secret has already been claimed');
    }

    const url = await this.urlsRepository.findOne({
      where: { id: anonymousSecret.urlId },
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    url.user = { id: userId } as any;
    await this.urlsRepository.save(url);

    anonymousSecret.isClaimed = true;
    anonymousSecret.claimedByUserId = userId;
    await this.secretsRepository.save(anonymousSecret);

    return url;
  }

  async getSecretDetails(secret: string): Promise<{
    shortCode: string;
    title?: string;
    description?: string;
    createdAt: Date;
  }> {
    const anonymousSecret = await this.secretsRepository.findOne({
      where: { secret },
      relations: ['url'],
    });

    if (!anonymousSecret) {
      throw new NotFoundException('Invalid secret');
    }

    if (anonymousSecret.isClaimed) {
      throw new BadRequestException('This secret has already been claimed');
    }

    const url = anonymousSecret.url;
    return {
      shortCode: url.shortCode,
      title: url.title,
      description: url.description,
      createdAt: url.createdAt,
    };
  }
}
