import { IsEmail, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(3)
  nickname: string;

  @IsOptional()
  @IsUrl()
  pfp?: string;
}
