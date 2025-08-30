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
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  async increaseStockQuantityWithManager(
    manager: EntityManager,
    materialId: number,
    quantity: number,
  ): Promise<void> {
    await manager.increment(
      Material,
      { id: materialId },
      'stockQuantity',
      quantity,
    );
  }
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
  ): Promise<{ data: Material[]; meta: any }> {
    // 현재 쿼리가 빈번하게 사용되는 '기본 조회'인지 판단
    const isDefaultQuery =
      !category && sort === 'desc' && page === 1 && limit === 5;

    // 기본 조회일 경우에만 Redis 캐시를 먼저 확인
    if (isDefaultQuery) {
      const cachedData = await this.redis.get('materials:default');
      // 캐시 데이터가 존재하면 DB 접근 없이 즉시 반환
      if (cachedData) {
        return JSON.parse(cachedData) as { data: Material[]; meta: any };
      }
    }

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

    // 응답 데이터를 표준화된 형식으로 구성
    const result = {
      data: materials,
      meta: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };

    // 현재 쿼리가 '기본 조회'였을 경우, 다음 요청을 위해 Redis에 저장
    if (isDefaultQuery) {
      await this.redis.set(
        'materials:default',
        JSON.stringify(result),
        'EX',
        3600 * 24 * 7,
      );
    }

    return result;
  }

  async findMaterialById(id: number) {
    const material = await this.materialRepository.findOne({ where: { id } });

    if (!material) {
      throw new NotFoundException('건축 자재를 찾을 수 없습니다.');
    }

    return material;
  }
}
