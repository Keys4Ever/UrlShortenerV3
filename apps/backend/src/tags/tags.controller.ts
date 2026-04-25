import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';

@Controller('api/tags')
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createTagDto: CreateTagDto) {
    const tag = await this.tagsService.create(createTagDto);
    return {
      success: true,
      data: tag,
    };
  }

  @Get()
  async findAll(
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '50',
  ) {
    const { tags, total } = await this.tagsService.findAll(
      parseInt(skip),
      parseInt(take),
    );

    return {
      success: true,
      data: {
        tags,
        total,
      },
    };
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('limit') limit: string = '20',
  ) {
    if (!query) {
      return {
        success: false,
        error: 'Query parameter required',
      };
    }

    const tags = await this.tagsService.search(query, parseInt(limit));
    return {
      success: true,
      data: tags,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tag = await this.tagsService.findOne(parseInt(id));
    return {
      success: true,
      data: tag,
    };
  }
}
