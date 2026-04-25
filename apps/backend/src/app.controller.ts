import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';
import { RankingsService } from './redis/rankings.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AdminGuard } from './auth/admin.guard';
import { UrlsService } from './urls/urls.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly rankingsService: RankingsService,
    private readonly urlsService: UrlsService,
  ) {}

  private getFrontend404Url(): string {
    const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:8080';
    return `${baseUrl.replace(/\/+$/, '')}/404`;
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('top-urls')
  async getTopUrls(@Query('limit') limit: string = '100') {
    const topUrls = await this.rankingsService.getTopUrls(parseInt(limit));
    return {
      success: true,
      data: {
        topUrls,
        limit: parseInt(limit),
      },
    };
  }

  @Get('api/docs')
  getApiDocs() {
    return {
      success: true,
      data: {
        version: '1.0.0',
        title: 'URL Shortener API',
        description: 'RESTful API for URL shortening with analytics',
        endpoints: {
          auth: {
            'POST /api/auth/register': 'Register new user',
            'POST /api/auth/login': 'Login user',
          },
          users: {
            'GET /api/users/profile': 'Get current user profile',
            'PUT /api/users/profile': 'Update user profile (nickname, pfp)',
          },
          urls: {
            'POST /api/urls': 'Create shortened URL (authenticated)',
            'GET /api/urls': 'Get user URLs with pagination',
            'GET /api/urls/:id/stats': 'Get statistics for URL',
            'PUT /api/urls/:id': 'Update URL metadata',
            'DELETE /api/urls/:id': 'Delete URL (soft delete)',
            'GET /api/urls/tag/:tagName': 'Get URLs by tag',
            'GET /:shortCode': 'Resolve short URL and redirect',
          },
          anonymous: {
            'POST /api/anonymous/create': 'Create anonymous shortened URL',
            'POST /api/anonymous/claim':
              'Claim anonymous URL with secret (authenticated)',
            'GET /api/anonymous/secret/:secret':
              'Get anonymous URL details by secret',
          },
          tags: {
            'POST /api/tags': 'Create tag (authenticated)',
            'GET /api/tags': 'Get all tags with pagination',
            'GET /api/tags/search?q=query': 'Search tags by name',
            'GET /api/tags/:id': 'Get tag details',
          },
          rankings: {
            'GET /top-urls?limit=100': 'Get top N most visited URLs',
          },
        },
      },
    };
  }

  @Get('api/check-session')
  @UseGuards(JwtAuthGuard)
  async checkSession(@Request() req) {
    return {
      success: true,
      data: {
        user: req.user,
        valid: true,
      },
    };
  }

  @Get('api/admin/dashboard')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAdminDashboard(@Request() req) {
    return {
      success: true,
      data: {
        message: 'Admin dashboard data',
        user: req.user,
      },
    };
  }

  @Get(':shortCode')
  async resolveShortCodeRoot(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const userAgent = req.headers['user-agent'];
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const referrer = req.headers['referer'] || req.headers['referrer'];

    try {
      const url = await this.urlsService.resolveShortCode(
        shortCode,
        userAgent,
        ip,
        referrer,
      );
      return res.redirect(301, url.originalUrl);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.redirect(302, this.getFrontend404Url());
      }
      throw error;
    }
  }
}
