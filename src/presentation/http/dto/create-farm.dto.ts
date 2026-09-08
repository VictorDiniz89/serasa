import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';
import { BRAZILIAN_STATES } from '../../../domain/farm/brazilian-state';

export class CreateFarmDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  city!: string;

  @IsString()
  @IsIn([...BRAZILIAN_STATES])
  state!: string;

  @Type(() => Number)
  @IsNumber()
  totalAreaHa!: number;

  @Type(() => Number)
  @IsNumber()
  arableAreaHa!: number;

  @Type(() => Number)
  @IsNumber()
  vegetationAreaHa!: number;
}