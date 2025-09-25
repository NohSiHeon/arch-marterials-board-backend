import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { FindMaterialsDto } from './dtos/find-materials.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UpdateMaterialDto } from './dtos/update-material.dto';
import { RoleGuard } from '@/auth/guards/roles.guard';
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

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(':id')
  async updateMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    const data = await this.materialsService.updateMaterial(
      id,
      updateMaterialDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: '자재 정보를 성공적으로 수정하였습니다.',
      data,
    };
  }
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete(':id')
  async deleteMaterial(@Param('id', ParseIntPipe) id: number) {
    const data = await this.materialsService.deleteMaterial(id);

    return {
      statusCode: HttpStatus.OK,
      message: '자재를 성공적으로 삭제하였습니다.',
      data,
    };
  }
}
