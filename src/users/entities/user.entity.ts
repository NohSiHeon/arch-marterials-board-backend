import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
} from '@nestjs/class-validator';
import { Order } from 'src/orders/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  @IsEmail({ message: '이메일 형식이 아닙니다.' })
  @Column({ unique: true })
  email: string;

  @Length(8, 16, { message: '비밀번호 확인은 최소 8자, 최대 16자여야 합니다.' })
  @Column()
  password: string;

  @IsNotEmpty({ message: '이름은 필수 입력 항목입니다.' })
  @Length(2, 10, { message: '이름은 최소 2자, 최대 10자여야 합니다.' })
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @Column()
  name: string;

  @IsString()
  @Column()
  phoneNumber: string;

  @IsString()
  @Column()
  address: string;

  @Column({ default: 0 })
  point: number;

  @IsDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date;

  // 첫 번째 인자: 연결한 엔티티를 화살표 함수로 반환
  // 두 번째 인자: Order 엔티티에서 User 엔티티를 참조하는 컬럼 지정
  @OneToMany(() => Order, (orders) => orders.user)
  orders: Order[];
}
