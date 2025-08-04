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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(req: Request, payload: Payload) {
    const userId = payload.userId;
    const incomingToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
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
