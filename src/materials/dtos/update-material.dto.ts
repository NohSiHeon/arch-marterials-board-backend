import { PickType } from '@nestjs/mapped-types';
import { Material } from '../entities/material.entity';
import { IsOptional } from 'class-validator';

export class UpdateMaterialDto extends PickType(Material, [
  'description',
  'stockQuantity',
  'price',
]) {
  @IsOptional()
  description: string;

  @IsOptional()
  stockQuantity: number;

  @IsOptional()
  price: number;
}
