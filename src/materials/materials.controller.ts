import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
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
      message: '자재 목록을 성공적으로 조회하였습니다.',
      data,
    };
  }

  @Get(':id')
  async findMaterial(@Param('id', ParseIntPipe) id: number) {
    const data = await this.materialsService.findMaterialById(id);

    return {
      statusCode: HttpStatus.OK,
      message: '자재를 성공적으로 조회하였습니다.',
      data,
    };
  }
}
