import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
} from '@nestjs/class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
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

  @IsDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date;
}
