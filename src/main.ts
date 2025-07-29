import { NestFactory } from '@nestjs/core';
import { AppModule } from './apps/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      transform: true, // 요청 본문을 DTO 클래스 인스턴스로 변환
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 에러 발생
    }),
  );
  app.setGlobalPrefix('api'); // 기본 엔드포인트 설정
  await app.listen(configService.get<string>('PORT') ?? 3001);
}
bootstrap();
