import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserInfo } from './decorators/user-info.decorator';
import { Payload } from 'src/auth/interfaces/payload.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@UserInfo() userInfo: Payload) {
    const user = await this.usersService.findUserById(userInfo.userId);

    return {
      statusCode: HttpStatus.OK,
      message: '내 프로필 조회에 성공했습니다.',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
