import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisService } from './redis.service';
import { RankingsService } from './rankings.service';
import { Url } from '../urls/entities/url.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Url])],
  providers: [RedisService, RankingsService],
  exports: [RedisService, RankingsService],
})
export class RedisModule {}
