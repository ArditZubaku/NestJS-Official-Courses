import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { log } from 'console';
import { AppModule } from './app.module';
import {
  HttpExceptionFilter,
  WrapResponseInterceptor,
  TimeoutInterceptor,
} from './common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        // Instead of using @Type(Function) decorator in DTOs
        // Converts property to TS declared types
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new WrapResponseInterceptor(),
    new TimeoutInterceptor(),
  );
  // app.useGlobalGuards(new ApiKeyGuard(app.get(ConfigService)));
  // await app.listen(3000);

  const options = new DocumentBuilder()
    .setTitle('Coffees API')
    .setDescription('Coffees API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  //SwaggerModule.setup('api', app, document);
  app.use(
    '/reference',
    apiReference({
      spec: {
        content: document,
      },
    }),
  );


  await app.listen(configService.getOrThrow('PORT'));
  log(
    `App is listening on port ${configService.getOrThrow<number>(
      'PORT',
    )} which is of type ${typeof configService.getOrThrow<number>('PORT')}`,
  );
}
bootstrap();
