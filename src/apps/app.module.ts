import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from 'src/config/db.config';
import { UsersModule } from 'src/users/users.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { redisConfig } from 'src/config/redis.config';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { OrdersModule } from 'src/orders/orders.module';
import { OrderItemsModule } from 'src/order-items/order-items.module';
import { MaterialsModule } from 'src/materials/materials.module';

@Module({
  imports: [
    // env 값 글로벌하게 설정
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: redisConfig,
    }),
    AuthModule,
    UsersModule,
    OrdersModule,
    OrderItemsModule,
    MaterialsModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
