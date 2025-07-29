import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 회원가입
  async signUp(signUpDto: SignUpDto) {
    const { email, password, passwordConfirm, ...etc } = signUpDto;

    const existedUser = await this.findUserByEmail(email);
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
    const user = await this.usersRepository.save({
      email,
      password: hashedPassword,
      ...etc,
    });

    return user;
  }

  async findUserByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email });
    return user;
  }
}
