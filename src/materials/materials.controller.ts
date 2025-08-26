import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { FindMaterialsDto } from './dtos/find-materials.dto';
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  async findMaterials(@Query() query: FindMaterialsDto) {
    const page = query.page || 1;
    const limit = query.limit || 5;
    const sort = query.sort || 'desc';
    const category = query.category;

    const data = await this.materialsService.findMaterials(
      sort,
      page,
      limit,
      category,
    );

    return {
      statusCode: HttpStatus.OK,
      message: '주문 목록을 성공적으로 조회하였습니다.',
      data,
    };
  }
}
