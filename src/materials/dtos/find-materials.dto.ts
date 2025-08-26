import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { MaterialCategory } from '../enums/material-category.enum';
import { Type } from 'class-transformer';

export class FindMaterialsDto {
  @IsOptional()
  @IsString()
  category?: MaterialCategory | undefined;

  @IsOptional()
  @IsIn(['asc', 'desc', ''])
  sort?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 5;
}
