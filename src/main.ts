import { NestFactory } from '@nestjs/core';
import { AppModule } from './core/app.module';
import { MainModule } from './core/main.module';

async function bootstrap() {
  const app = await NestFactory.create(MainModule);
  await app.listen(3000);
}
bootstrap();
