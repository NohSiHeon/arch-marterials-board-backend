import {
  Controller,
  Post,
  Body,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserInfo } from 'src/users/decorators/user-info.decorator';
import { Payload } from './interfaces/payload.interface';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto, @UserInfo() userInfo: Payload) {
    const data = await this.authService.signIn(userInfo);
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sign-out')
  async signOut(@UserInfo() userInfo: Payload) {
    await this.authService.signOut(userInfo.userId);
    return {
      statusCode: HttpStatus.OK,
      message: '로그아웃 되었습니다.',
    };
  }
}
