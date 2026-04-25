import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const existing = await this.tagsRepository.findOne({
      where: { name: createTagDto.name },
    });

    if (existing) {
      throw new ConflictException(`Tag "${createTagDto.name}" already exists`);
    }

    const tag = this.tagsRepository.create(createTagDto);
    return this.tagsRepository.save(tag);
  }

  async findAll(skip = 0, take = 50): Promise<{ tags: Tag[]; total: number }> {
    const [tags, total] = await this.tagsRepository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
    });

    return { tags, total };
  }

  async findOne(id: number): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({
      where: { id },
      relations: ['urls'],
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }

  async getOrCreate(name: string): Promise<Tag> {
    let tag = await this.tagsRepository.findOne({ where: { name } });
    if (!tag) {
      tag = this.tagsRepository.create({ name });
      await this.tagsRepository.save(tag);
    }
    return tag;
  }

  async search(query: string, limit = 20): Promise<Tag[]> {
    return this.tagsRepository
      .createQueryBuilder('tag')
      .where('tag.name ILIKE :query', { query: `%${query}%` })
      .limit(limit)
      .getMany();
  }
}
