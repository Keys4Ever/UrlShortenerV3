import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'createdAt', 'updatedAt'],
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.usersRepository.create(createUserDto);
    await this.usersRepository.save(user);

    const { password, ...result } = user;
    return result as User;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateProfile(
    id: number,
    updateProfileDto: UpdateUserProfileDto,
  ): Promise<User> {
    const user = await this.findOne(id);

    if (updateProfileDto.nickname !== undefined) {
      user.nickname = updateProfileDto.nickname;
    }
    if (updateProfileDto.pfp !== undefined) {
      user.pfp = updateProfileDto.pfp;
    }

    return this.usersRepository.save(user);
  }

  async getProfile(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['urls', 'claimedSecrets'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...result } = user;
    return result as User;
  }
}
