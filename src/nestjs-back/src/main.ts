import { NestFactory } from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  console.log(__dirname);

  if (process.env.NODE_ENV !== 'development') {
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

  await app.listen(3000);
}

bootstrap();
