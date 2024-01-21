import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';

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
        // Converts property to TS declared types
        enableImplicitConversion: true,
      },
    }),
  );
  // await app.listen(3000);
  await app.listen(configService.getOrThrow('PORT'));
  log(
    `App is listening on port ${configService.getOrThrow<number>(
      'PORT',
    )} which is of type ${typeof configService.getOrThrow<number>('PORT')}`,
  );
}
bootstrap();
