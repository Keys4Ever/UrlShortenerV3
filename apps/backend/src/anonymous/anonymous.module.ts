import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnonymousService } from './anonymous.service';
import { AnonymousController } from './anonymous.controller';
import { Url } from '../urls/entities/url.entity';
import { AnonymousSecret } from './entities/anonymous-secret.entity';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Url, AnonymousSecret]), RedisModule],
  controllers: [AnonymousController],
  providers: [AnonymousService],
  exports: [AnonymousService],
})
export class AnonymousModule {}
