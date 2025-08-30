import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  Get,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserInfo } from 'src/users/decorators/user-info.decorator';
import { Payload } from 'src/auth/interfaces/payload.interface';
import { MaterialCategory } from '@/materials/enums/material-category.enum';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(
    @UserInfo() payload: Payload,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const { userId } = payload;
    const data = await this.ordersService.createOrder(userId, createOrderDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: '주문을 성공적으로 완료하였습니다.',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/refund')
  async refundOrder(
    @UserInfo() payload: Payload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const { userId } = payload;
    const data = await this.ordersService.refundOrder(userId, id);

    return {
      status: HttpStatus.OK,
      message: '환불을 성공적으로 완료하였습니다.',
      data,
    };
  }
}
