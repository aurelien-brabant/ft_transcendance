import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
// import seeder from './seeder';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true
  });

  if (process.env.NODE_ENV === 'development') {

    const customOptions: SwaggerCustomOptions = {
      customCssUrl: '/material_swagger.css'
    }

    const config = new DocumentBuilder()
      .setTitle('ft_transcendance')
      .setDescription(
        'The API that supports ft_transcendance, a wonderful web-based multiplayer pong game',
      )
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('apidoc', app, document, customOptions);
  }

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    }),
  );

  // seeder();

  app.use(cookieParser())

  await app.listen(3000);
}

bootstrap();
