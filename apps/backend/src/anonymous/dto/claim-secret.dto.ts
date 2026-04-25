import { IsString, IsNotEmpty } from 'class-validator';

export class ClaimSecretDto {
  @IsString()
  @IsNotEmpty()
  secret: string;

  @IsString()
  @IsNotEmpty()
  shortCode: string;
}
