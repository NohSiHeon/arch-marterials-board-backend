import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { Payload } from '../interfaces/payload.interface';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    const secret = configService.get<string>('ACCESS_SECRET_KEY');
    if (!secret) {
      throw new Error('ACCESS_SECRET_KEY is not defined');
    }
    super({
      // HTTP 요청에서 JWT를 추출하는 방법을 정의
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 검증 로직에 Request 객체를 전달할지 여부 설정
      passReqToCallback: true,
      // 토큰의 만료 시간을 무시할지 여부 설정
      ignoreExpiration: false,
      // 토큰의 서명을 검증하는데 사용될 비밀 키 설정
      secretOrKey: secret,
    });
  }

  async validate(req: Request, payload: Payload) {
    const userId = payload.userId;
    // 요청과 함께 들어온 토큰 값
    const incomingToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    // Redis에 있는 토큰 값
    const tokenInRedis = await this.redis.get(`accessToken:userId:${userId}`);

    // 토근 값 검증
    if (!tokenInRedis || tokenInRedis !== incomingToken) {
      throw new UnauthorizedException('Invalid or expired Token1');
    }

    // 존재하는 사용자인지 검증
    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('유효하지 않은 사용자입니다.');
    }
    // 토큰값에 유저의 이름과 저장되어있는 유저의 이름이 같은지 검증
    if (user.name !== payload.userName) {
      throw new UnauthorizedException('Invalid or expired Token2');
    }
    return { userId: userId, userName: user.name };
  }
}
