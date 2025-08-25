import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MaterialName } from 'src/materials/enums/material-name.enum';

export class OrderItemDto {
  @IsEnum(MaterialName)
  @IsNotEmpty()
  name: MaterialName;

  @IsNumber()
  @IsNotEmpty()
  count: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @IsString()
  @IsNotEmpty()
  shippingAddress: string;
}
