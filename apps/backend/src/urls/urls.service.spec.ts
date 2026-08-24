import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LOGGY_LOGGER } from '@loggy-logs/node/nest';
import { Url } from './entities/url.entity';
import { UrlStat } from './entities/url-stat.entity';
import { Tag } from '../tags/entities/tag.entity';
import { RedisService } from '../redis/redis.service';
import { UrlsService } from './urls.service';

describe('UrlsService observability', () => {
  let service: UrlsService;
  const loggyLogger = { info: jest.fn() };
  const urlsRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };
  const redisService = {
    incrementUrlClicks: jest.fn(),
    clearUrlStatsCache: jest.fn(),
  };
  const urlStatsRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        { provide: getRepositoryToken(Url), useValue: urlsRepository },
        { provide: getRepositoryToken(UrlStat), useValue: urlStatsRepository },
        { provide: getRepositoryToken(Tag), useValue: {} },
        { provide: RedisService, useValue: redisService },
        { provide: LOGGY_LOGGER, useValue: loggyLogger },
      ],
    }).compile();

    service = module.get(UrlsService);
    urlsRepository.update.mockResolvedValue(undefined);
    urlStatsRepository.create.mockReturnValue({});
    urlStatsRepository.save.mockResolvedValue(undefined);
    redisService.incrementUrlClicks.mockResolvedValue(undefined);
    redisService.clearUrlStatsCache.mockResolvedValue(undefined);
  });

  it('emits a redirect event without destination or visitor data', async () => {
    urlsRepository.findOne.mockResolvedValue({
      id: 42,
      shortCode: 'abc123',
      originalUrl: 'https://private.example/account',
      clickCount: 7,
    });

    await service.resolveShortCode(
      'abc123',
      'secret user agent',
      '203.0.113.10',
      'https://referrer.example',
    );

    expect(loggyLogger.info).toHaveBeenCalledWith('Short URL redirected', {
      eventName: 'url.redirected',
      attributes: {
        short_code: 'abc123',
        'http.response.status_code': 301,
      },
    });
    expect(JSON.stringify(loggyLogger.info.mock.calls)).not.toContain(
      'private.example',
    );
    expect(JSON.stringify(loggyLogger.info.mock.calls)).not.toContain(
      '203.0.113.10',
    );
    expect(JSON.stringify(loggyLogger.info.mock.calls)).not.toContain(
      'secret user agent',
    );
    expect(JSON.stringify(loggyLogger.info.mock.calls)).not.toContain(
      'referrer.example',
    );
  });
});
