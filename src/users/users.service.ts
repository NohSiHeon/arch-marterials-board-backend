import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // email로 유효한 유저인지 확인
  async findUserByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email });
    return user;
  }

  // id로 유효한 유저인지 확인
  async findUserById(id: number) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }
    return user;
  }

  // 트랜잭션을 통한 id로 유효한 유저인지 확인
  async findUserByIdWithManager(manager: EntityManager, userId: number) {
    const user = await manager.findOne(User, {
      where: { id: userId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!user) {
      throw new NotFoundException('유효하지 않은 회원입니다.');
    }

    return user;
  }

  // 포인트 증가
  async increasePointWithManager(
    manager: EntityManager,
    user: User,
    price: number,
  ) {
    user.point += price;
    await manager.save(User, user);
    return;
  }
  // 포인트 차감
  async decreasePointWithManager(
    manager: EntityManager,
    user: User,
    totalPrice: number,
  ): Promise<void> {
    user.point -= totalPrice;
    await manager.save(User, user);
  }

  // 회원가입
  async registerUser(
    email: string,
    password: string,
    etc: Omit<SignUpDto, 'email' | 'password' | 'passwordConfirm'>,
  ) {
    const user = await this.usersRepository.save({
      email,
      password,
      point: 0,
      ...etc,
    });

    return user;
  }

  // 유저 포인트가 부족한지 확인
  async validateUserPoint(
    manager: EntityManager,
    userId: number,
    totalPrice: number,
  ): Promise<User> {
    const user = await manager.findOne(User, {
      where: { id: userId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!user) {
      throw new BadRequestException('유저 정보를 찾을 수 없습니다.');
    }

    if (user.point < totalPrice) {
      throw new BadRequestException('포인트가 부족합니다.');
    }

    return user;
  }
}
