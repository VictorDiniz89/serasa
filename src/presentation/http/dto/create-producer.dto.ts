import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProducerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  document!: string;
}