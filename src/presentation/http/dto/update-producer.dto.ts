import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProducerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  document?: string;
}
