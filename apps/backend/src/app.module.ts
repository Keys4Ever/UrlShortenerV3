import 'dotenv/config';

import { Module } from '@nestjs/common';
import { LoggyLogsModule } from '@loggy-logs/node/nest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UrlsModule } from './urls/urls.module';
import { TagsModule } from './tags/tags.module';
import { AnonymousModule } from './anonymous/anonymous.module';
import { RedisModule } from './redis/redis.module';
import { User } from './users/entities/user.entity';
import { Url } from './urls/entities/url.entity';
import { UrlStat } from './urls/entities/url-stat.entity';
import { Tag } from './tags/entities/tag.entity';
import { AnonymousSecret } from './anonymous/entities/anonymous-secret.entity';

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggyLogsModule.forRoot({
      serviceName: 'url-shortener',
      serviceVersion: process.env.APP_VERSION || 'dev',
      environment: process.env.NODE_ENV || 'development',
      instanceId: process.env.HOSTNAME,
      destination: {
        type: 'file',
        path: process.env.LOG_FILE || './logs/app.jsonl',
        maxBytes: parsePositiveInt(
          process.env.LOG_MAX_BYTES,
          100 * 1024 * 1024,
        ),
        maxFiles: parsePositiveInt(process.env.LOG_MAX_FILES, 5),
      },
      http: {
        enabled: true,
        requestIdHeader: 'x-request-id',
      },
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'url_shortener',
      entities: [User, Url, UrlStat, Tag, AnonymousSecret],
      synchronize: parseBool(
        process.env.TYPEORM_SYNCHRONIZE,
        process.env.NODE_ENV !== 'production',
      ),
      logging: parseBool(
        process.env.TYPEORM_LOGGING,
        process.env.NODE_ENV !== 'production',
      ),
    }),
    RedisModule,
    AuthModule,
    UsersModule,
    UrlsModule,
    TagsModule,
    AnonymousModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
