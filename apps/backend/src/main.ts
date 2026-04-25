import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

const DEFAULT_DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://[::1]:5173',
  'http://[::1]:8080',
];

function corsOrigins(): string[] {
  const extra = process.env.CORS_ORIGIN?.trim()
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  if (process.env.NODE_ENV === 'production') {
    return extra.length > 0 ? extra : DEFAULT_DEV_ORIGINS;
  }
  return [...new Set([...DEFAULT_DEV_ORIGINS, ...extra])];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const origins = corsOrigins();
  const isProd = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: isProd ? origins : true,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Origin',
    ],
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`ulnk.lat API running on http://localhost:${port}`);
}
bootstrap();
