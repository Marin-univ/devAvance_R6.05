import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class MatchInputDto {
  @IsString()
  @IsNotEmpty()
  winner: string;

  @IsString()
  @IsNotEmpty()
  loser: string;

  @IsBoolean()
  @IsOptional()
  draw?: boolean;
}
