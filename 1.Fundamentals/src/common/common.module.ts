import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './guards/api-key.guard';
import { ConfigModule } from '@nestjs/config';
import { LoggingMiddleware } from '../common';

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
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Can not tie middlewares via decorators
    consumer.apply(LoggingMiddleware).forRoutes('*');
    // consumer.apply(LoggingMiddleware).forRoutes({
    //   path: 'coffees',
    //   method: RequestMethod.GET,
    // });
  }
}
