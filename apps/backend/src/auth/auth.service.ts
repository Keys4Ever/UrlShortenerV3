import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ApiResponse } from 'src/types/ApiResponseType';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any): Promise<ApiResponse<{ access_token: string }>> {
    const payload = { email: user.email, sub: user.id };
    return {
      success: true,
      data: {
        access_token: this.jwtService.sign(payload),
      },
    };
  }

  async register(
    createUserDto: CreateUserDto,
  ): Promise<ApiResponse<Partial<CreateUserDto>>> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const { password, ...result } = user;
    return {
      success: true,
      data: result,
    };
  }
}
