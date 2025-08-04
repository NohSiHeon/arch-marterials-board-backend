import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { SignInDto } from './dto/sign-in.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  // 회원가입
  async signUp(signUpDto: SignUpDto) {
    const { email, password, passwordConfirm, ...etc } = signUpDto;

    const existedUser = await this.usersService.findUserByEmail(email);
    if (existedUser) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    if (password !== passwordConfirm) {
      throw new BadRequestException(
        '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
      );
    }
    const hashRounds = this.configService.get<number>('HASH_ROUNDS') as number;
    const hashedPassword = await bcrypt.hash(password, +hashRounds);

    const user = await this.usersService.registerUser(
      email,
      hashedPassword,
      etc,
    );

    return user;
  }
  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const existedUser = await this.usersService.findUserByEmail(email);
    if (!existedUser) {
      throw new NotFoundException(
        '등록된 회원이 아니거나, 비밀번호가 일치하지 않습니다.',
      );
    }
    // 패스워드 검증
    const isMatchedPassword = await bcrypt.compare(
      password,
      existedUser.password,
    );
    if (!isMatchedPassword) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    const payload = { id: existedUser.id, username: existedUser.name };
    // 토큰 발급
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('ACCESS_SECRET_KEY'),
      expiresIn: '1h',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('REFRESH_SECRET_KEY'),
      expiresIn: '3d',
    });

    await this.redis.setex(
      `accessToken:userId:${existedUser.id}`,
      60 * 60,
      accessToken,
    );

    await this.redis.setex(
      `refreshToken:userId:${existedUser.id}`,
      60 * 60 * 24 * 7,
      refreshToken,
    );
    return { accessToken, refreshToken };
  }
}
