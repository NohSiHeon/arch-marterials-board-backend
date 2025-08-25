import { OrderItem } from 'src/order-items/entities/order-item.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MaterialCategory } from '../enums/material-category.enum';
import { MaterialName } from '../enums/material-name.enum';

@Entity()
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: MaterialName,
  })
  name: MaterialName;

  @Column({
    type: 'enum',
    enum: MaterialCategory,
  })
  category: MaterialCategory;

  @Column()
  description: string;

  @Column({ type: 'integer', default: 0 })
  stockQuantity: number;

  @Column()
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderItem, (orderItems) => orderItems.material)
  orderItems: OrderItem;
}
