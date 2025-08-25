import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { MaterialsService } from 'src/materials/materials.service';
import { OrderItemsService } from 'src/order-items/order-items.service';
import { OrderStatus } from './enums/status.enum';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly materialsService: MaterialsService,
    private readonly orderItemsService: OrderItemsService,
    private readonly usersService: UsersService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}
  // 주문하기
  async createOrder(
    userId: number,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { shippingAddress, orderItems } = createOrderDto;
      let totalPrice = 0;

      // 자재 재고 및 총액 확인
      for (const item of orderItems) {
        const material =
          await this.materialsService.validateMaterialAndGetPrice(
            queryRunner.manager,
            item.name,
            item.count,
          );
        totalPrice += material.price * item.count;
      }

      // 유저 포인트 확인
      const user = await this.usersService.validateUserPoint(
        queryRunner.manager,
        userId,
        totalPrice,
      );

      const newOrder = await queryRunner.manager.save(Order, {
        user: { id: userId },
        totalAmount: totalPrice,
        status: OrderStatus.PAID,
        shippingAddress: shippingAddress,
      });

      for (const item of orderItems) {
        const material =
          await this.materialsService.validateMaterialAndGetPrice(
            queryRunner.manager,
            item.name,
            item.count,
          );

        await this.orderItemsService.createOrderItemWithManager(
          queryRunner.manager,
          newOrder.id,
          item.count,
          material.price,
          material.id,
        );
      }

      // 유저 포인트 차감
      await this.usersService.decreasePointWithManager(
        queryRunner.manager,
        user,
        totalPrice,
      );
      // 자재 재고 차감
      for (const item of orderItems) {
        const material =
          await this.materialsService.validateMaterialAndGetPrice(
            queryRunner.manager,
            item.name,
            item.count,
          );

        await this.materialsService.decreaseStockQuantityWithManager(
          queryRunner.manager,
          material.id,
          item.count,
        );
      }

      await queryRunner.commitTransaction();
      return newOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
