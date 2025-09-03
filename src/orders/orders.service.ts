import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  DataSource,
  EntityManager,
  FindManyOptions,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { MaterialsService } from 'src/materials/materials.service';
import { OrderItemsService } from 'src/order-items/order-items.service';
import { OrderStatus } from './enums/status.enum';
import { UsersService } from 'src/users/users.service';
import { MaterialCategory } from '@/materials/enums/material-category.enum';
import { find } from 'rxjs';

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
  async findOrderById(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'user'],
    });
    if (!order) {
      throw new NotFoundException('존재하지 않거나 유효하지 않은 주문입니다.');
    }
    return order;
  }

  async findOrderByIdWithManager(manager: EntityManager, id: number) {
    const order = await manager.findOne(Order, {
      where: { id },
      relations: ['orderItems', 'user', 'orderItems.material'],
      lock: { mode: 'pessimistic_write' },
    });

    if (!order) {
      throw new NotFoundException('존재하지 않거나 유효하지 않은 주문입니다.');
    }

    return order;
  }

  // 주문 취소(환불)
  async refundOrder(userId: number, id: number) {
    const order = await this.findOrderById(id);
    if (order.user.id !== userId) {
      throw new ForbiddenException('접근 권한이 없는 주문입니다.');
    }

    if (order.status === OrderStatus.REFUNDED) {
      throw new ConflictException('이미 환불된 주문입니다.');
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 주문 조회
      const order = await this.findOrderByIdWithManager(
        queryRunner.manager,
        id,
      );
      // 이미 주문의 상태가 환불인 경우
      if (order.status === OrderStatus.REFUNDED) {
        throw new ConflictException('이미 환불된 주문입니다.');
      }
      // 주문의 상태를 환불로 변경
      await queryRunner.manager.update(
        Order,
        { id },
        { status: OrderStatus.REFUNDED },
      );

      // 유효한 유저인지 확인
      const user = await this.usersService.findUserByIdWithManager(
        queryRunner.manager,
        userId,
      );
      // 유저 포인트 환불
      await this.usersService.increasePointWithManager(
        queryRunner.manager,
        user,
        order.totalAmount,
      );
      // 자재 재고 증가
      for (const item of order.orderItems) {
        if (item.material) {
          await this.materialsService.increaseStockQuantityWithManager(
            queryRunner.manager,
            item.material.id,
            item.quantity,
          );
        }
      }

      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
