import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { UrlCleanupService } from './url-cleanup.service';
import { Url } from './entities/url.entity';
import { UrlStat } from './entities/url-stat.entity';
import { Tag } from '../tags/entities/tag.entity';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Url, UrlStat, Tag]), RedisModule],
  controllers: [UrlsController],
  providers: [UrlsService, UrlCleanupService],
  exports: [UrlsService],
})
export class UrlsModule {}
