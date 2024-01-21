import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './guards/api-key/api-key.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      /*
        When you provide a guard with the APP_GUARD token, NestJS applies that guard globally, regardless of which module it's provided in. This means that the guard will be used across all routes in every module in your application, not just the routes in the module where the guard is provided.
      */
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class CommonModule {}
