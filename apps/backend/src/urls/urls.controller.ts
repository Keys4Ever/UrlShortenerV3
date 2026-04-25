import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  Res,
  Header,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';

@Controller('api/urls')
export class UrlsController {
  constructor(private urlsService: UrlsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req: any, @Body() createUrlDto: CreateUrlDto) {
    const url = await this.urlsService.create(req.user.id, createUrlDto);
    return {
      success: true,
      data: {
        id: url.id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.SHORT_URL_BASE || 'http://localhost:3000'}/${url.shortCode}`,
        title: url.title,
        description: url.description,
        createdAt: url.createdAt,
      },
    };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getUserUrls(
    @Request() req: any,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '20',
  ) {
    const { urls, total } = await this.urlsService.getUserUrls(
      req.user.id,
      parseInt(skip),
      parseInt(take),
    );

    return {
      success: true,
      data: {
        urls: urls.map((url) => ({
          id: url.id,
          originalUrl: url.originalUrl,
          shortCode: url.shortCode,
          shortUrl: `${process.env.SHORT_URL_BASE || 'http://localhost:3000'}/${url.shortCode}`,
          title: url.title,
          description: url.description,
          clickCount: url.clickCount,
          tags: url.tags?.map((t) => t.name) || [],
          createdAt: url.createdAt,
        })),
        total,
      },
    };
  }

  @Get(':id/stats')
  @UseGuards(AuthGuard('jwt'))
  async getStats(@Param('id') id: string, @Request() req: any) {
    const stats = await this.urlsService.getUrlStats(parseInt(id), req.user.id);
    return {
      success: true,
      data: stats,
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateUrlDto: UpdateUrlDto,
  ) {
    const url = await this.urlsService.update(
      req.user.id,
      parseInt(id),
      updateUrlDto,
    );
    return {
      success: true,
      data: {
        id: url.id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.SHORT_URL_BASE || 'http://localhost:3000'}/${url.shortCode}`,
        title: url.title,
        description: url.description,
        tags: url.tags?.map((t) => t.name) || [],
      },
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string, @Request() req: any) {
    await this.urlsService.delete(req.user.id, parseInt(id));
    return {
      success: true,
      message: 'URL deleted successfully',
    };
  }

  @Get('tag/:tagName')
  @UseGuards(AuthGuard('jwt'))
  async getByTag(@Param('tagName') tagName: string, @Request() req: any) {
    const urls = await this.urlsService.getUrlsByTag(req.user.id, tagName);
    return {
      success: true,
      data: urls.map((url) => ({
        id: url.id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.SHORT_URL_BASE || 'http://localhost:3000'}/${url.shortCode}`,
        title: url.title,
        clickCount: url.clickCount,
        tags: url.tags?.map((t) => t.name) || [],
      })),
    };
  }

  @Get(':shortCode')
  async resolve(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const userAgent = req.headers['user-agent'];
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const referrer = req.headers['referer'] || req.headers['referrer'];

    const url = await this.urlsService.resolveShortCode(
      shortCode,
      userAgent,
      ip,
      referrer,
    );

    res.redirect(301, url.originalUrl);
  }
}
