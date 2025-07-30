import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findUserByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email });
    return user;
  }

  async registerUser(
    email: string,
    password: string,
    etc: Omit<SignUpDto, 'email' | 'password' | 'passwordConfirm'>,
  ) {
    const user = await this.usersRepository.save({
      email,
      password,
      ...etc,
    });

    return user;
  }
}
