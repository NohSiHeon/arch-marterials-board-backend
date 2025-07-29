import { IsNotEmpty, IsString } from '@nestjs/class-validator';
import { PickType } from '@nestjs/mapped-types';
import { User } from 'src/users/entities/user.entity';

export class SignUpDto extends PickType(User, [
  'email',
  'name',
  'password',
  'address',
  'phoneNumber',
]) {
  /**
   * 비밀번호 확인
   * @example "qwer1234"
   */

  @IsNotEmpty({ message: '비밀번호 확인은 필수 입력 항목입니다.' })
  @IsString()
  passwordConfirm: string;
}
