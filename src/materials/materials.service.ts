import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { EntityManager, Repository } from 'typeorm';
import { MaterialName } from './enums/material-name.enum';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
  ) {}

  async decreaseStockQuantityWithManager(
    manager: EntityManager,
    materialId: number,
    quantity: number,
  ): Promise<void> {
    await manager.decrement(
      Material,
      { id: materialId },
      'stockQuantity',
      quantity,
    );
  }

  async validateMaterialAndGetPrice(
    manager: EntityManager,
    name: MaterialName,
    count: number,
  ): Promise<Material> {
    const material = await manager.findOne(Material, {
      where: { name },
    });

    if (!material) {
      throw new NotFoundException('해당 자재를 찾을 수 없습니다.');
    }

    if (material.stockQuantity < count) {
      throw new BadRequestException('재고 수량이 부족합니다.');
    }

    return material;
  }
}
