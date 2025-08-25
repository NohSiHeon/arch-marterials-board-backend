import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { EntityManager, FindManyOptions, Repository } from 'typeorm';
import { MaterialName } from './enums/material-name.enum';
import { MaterialCategory } from './enums/material-category.enum';

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
  // 자재 목록 조회
  async findMaterials(
    sort: 'asc' | 'desc',
    page: number,
    limit: number,
    category: MaterialCategory | undefined,
  ) {
    // 요청에 따라 where 조건 동적 할당
    const whereCondition: FindManyOptions<Material>['where'] = category
      ? { category }
      : {};

    // TypeORM의 findAndCount 메서드에 적용할 옵션 객체
    const findOptions: FindManyOptions<Material> = {
      where: whereCondition,
      order: {
        createdAt: sort,
      },
      skip: (page - 1) * limit, // 페이지 번호와 항목 수 에 따라 건너뛸 데이터 계산
      take: limit, // 한 페이지에 가져올 데이터 수 지정
    };

    // 자재 목록 배열과, 전체 개수를 동시에 조회하여 구조분해 할당
    const [materials, totalCount] =
      await this.materialRepository.findAndCount(findOptions);

    return {
      data: materials, // 현재 페이지의 데이터
      meta: {
        totalCount, // 전체 데이터 개수
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit), // 총 페이지 수 계산
      },
    };
  }
}
