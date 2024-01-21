import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffeesModule } from './coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeeRatingModule } from './coffee-rating/coffee-rating.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import appConfig from './config/app.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
