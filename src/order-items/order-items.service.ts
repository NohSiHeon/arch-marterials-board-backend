import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async createOrderItemWithManager(
    manager: EntityManager,
    orderId: number,
    quantity: number,
    unitPrice: number,
    materialId: number,
  ) {
    const order = await manager.create(OrderItem, {
      order: { id: orderId },
      material: { id: materialId },
      quantity,
      unitPrice,
    });
    await manager.save(order);
    return true;
  }
}
