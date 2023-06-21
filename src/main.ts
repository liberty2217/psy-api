import { config } from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Psy API')
    .setDescription('Psy API description')
    .setVersion('1.0')
    .addTag('psy')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
