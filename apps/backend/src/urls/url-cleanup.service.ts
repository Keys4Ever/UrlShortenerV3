import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { Url } from './entities/url.entity';

@Injectable()
export class UrlCleanupService {
  private readonly logger = new Logger(UrlCleanupService.name);

  constructor(
    @InjectRepository(Url)
    private readonly urlsRepository: Repository<Url>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug('Running daily URL cleanup job...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.urlsRepository.delete({
      createdAt: LessThan(thirtyDaysAgo),
      user: IsNull(),
    });

    if (result.affected && result.affected > 0) {
      this.logger.log(`Deleted ${result.affected} expired URLs.`);
    } else {
      this.logger.debug('No expired URLs found.');
    }
  }
}
