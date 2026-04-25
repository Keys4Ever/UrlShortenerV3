import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUrlDto {
  @IsOptional()
  @IsUrl()
  originalUrl?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
