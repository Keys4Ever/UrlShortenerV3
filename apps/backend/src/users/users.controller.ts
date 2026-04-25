import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req: any) {
    const user = await this.usersService.getProfile(req.user.id);

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        pfp: user.pfp,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(
    @Request() req: any,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const user = await this.usersService.updateProfile(
      req.user.id,
      updateUserProfileDto,
    );

    return {
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        pfp: user.pfp,
        updatedAt: user.updatedAt,
      },
    };
  }
}
