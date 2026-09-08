import { Transform, Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { BRAZILIAN_STATES } from '../../../domain/farm/brazilian-state';

export class UpdateFarmDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  city?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsIn([...BRAZILIAN_STATES])
  state?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalAreaHa?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  arableAreaHa?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  vegetationAreaHa?: number;
}