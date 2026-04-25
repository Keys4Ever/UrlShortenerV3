import { IsString, IsUrl, IsOptional } from 'class-validator';

export class CreateAnonymousUrlDto {
  @IsUrl()
  originalUrl: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
