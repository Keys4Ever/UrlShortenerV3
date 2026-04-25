import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
