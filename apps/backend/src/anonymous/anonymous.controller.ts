import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnonymousService } from './anonymous.service';
import { CreateAnonymousUrlDto } from './dto/create-anonymous-url.dto';
import { ClaimSecretDto } from './dto/claim-secret.dto';

@Controller('api/anonymous')
export class AnonymousController {
  constructor(private anonymousService: AnonymousService) {}

  @Post('create')
  async create(@Body() createAnonymousUrlDto: CreateAnonymousUrlDto) {
    const result = await this.anonymousService.create(createAnonymousUrlDto);

    return {
      success: true,
      data: result,
    };
  }

  @Post('claim')
  @UseGuards(AuthGuard('jwt'))
  async claim(@Request() req: any, @Body() claimSecretDto: ClaimSecretDto) {
    const url = await this.anonymousService.claimSecret(
      req.user.id,
      claimSecretDto.secret,
    );

    return {
      success: true,
      message: 'URL claimed successfully',
      data: {
        id: url.id,
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        shortUrl: `${process.env.SHORT_URL_BASE || 'http://localhost:3000'}/${url.shortCode}`,
        title: url.title,
        description: url.description,
      },
    };
  }

  @Get('secret/:secret')
  async getSecretDetails(@Param('secret') secret: string) {
    const details = await this.anonymousService.getSecretDetails(secret);

    return {
      success: true,
      data: details,
    };
  }
}
