import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AppService } from './app.service';
import { CoffeeRatingModule } from './coffee-rating/coffee-rating.module';
import { CoffeesModule } from './coffees/coffees.module';
import { CommonModule, HttpExceptionFilter } from './common';
import appConfig from './config/app.config';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // type: 'postgres',
        // host: process.env.DATABASE_HOST,
        // port: +process.env.DATABASE_PORT, // + is for type conversion to number
        // username: process.env.DATABASE_USER,
        // password: process.env.DATABASE_PASSWORD,
        // database: process.env.DATABASE_NAME,
        // autoLoadEntities: true, // models will be loaded automatically (you don't have to explicitly specify the entities: [] array)
        // synchronize: true, // it will auto create tables based on the entities
        type: 'postgres',
        host: configService.getOrThrow('DATABASE_HOST'),
        port: configService.getOrThrow('DATABASE_PORT'),
        username: configService.getOrThrow('DATABASE_USER'),
        password: configService.getOrThrow('DATABASE_PASSWORD'),
        database: configService.getOrThrow('DATABASE_NAME'),
        autoLoadEntities: true, // models will be loaded automatically (you don't have to explicitly specify the entities: [] array)
        synchronize: true, // it will auto create tables based on the entities
      }),
    }),
    ConfigModule.forRoot({
      // ignoreEnvFile: true,
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.required(),
        DATABASE_PORT: Joi.number().default(5555),
      }),
      load: [appConfig],
    }),
    CoffeesModule,
    CoffeeRatingModule,
    DatabaseModule,
    ConfigModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global pipe -> since app.module scope is global
    // {
    //   provide: APP_PIPE,
    //   useClass: ValidationPipe,
    // },

    // This way the filter is managed by NestJS's dependency injection system, which means it can have dependencies injected into it.
    /*
    If you need to use dependency injection in your filter, use provide: APP_FILTER. If not, you can use app.useGlobalFilters().
     */
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
