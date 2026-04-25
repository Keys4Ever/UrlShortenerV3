import { IsString, IsUrl, IsOptional, IsArray, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUrlDto {
  @IsUrl()
  originalUrl: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== 'string') return undefined;
    const t = value.trim().toLowerCase();
    return t === '' ? undefined : t;
  })
  @MinLength(3, { message: 'Custom short path must be at least 3 characters' })
  @MaxLength(32, { message: 'Custom short path cannot exceed 32 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Custom short path may only use lowercase letters, digits, and single hyphens between segments',
  })
  customShortCode?: string;

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
