import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CoffeesModule } from '../../src/coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import appConfig from '../../src/config/app.config';

describe('[Feature] Coffees - /coffees', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CoffeesModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.getOrThrow('DATABASE_HOST'),
            port: configService.getOrThrow('DATABASE_PORT'),
            username: configService.getOrThrow('DATABASE_USER'),
            password: configService.getOrThrow('DATABASE_PASSWORD'),
            database: configService.getOrThrow('DATABASE_NAME'),
            autoLoadEntities: true,
            synchronize: true,
          }),
        }),
        ConfigModule.forRoot({
          validationSchema: Joi.object({
            DATABASE_HOST: Joi.required(),
            DATABASE_PORT: Joi.number().default(5556),
          }),
          load: [appConfig],
        }),
      ],
    }).compile();

    app = module.createNestApplication();

    await app.init();
  });

  it.todo('Create [POST /]');
  it.todo('Get all [GET /]');
  it.todo('Get one [GET /:id]');
  it.todo('Update one [PATCH /:id]');
  it.todo('Delete one [DELETE /:id]');

  //   it('Create [POST /]', () => {
  //     return app
  //       .inject()
  //       .post('/coffees')
  //       .send({
  //         name: 'Shipwreck Roast',
  //         brand: 'Buddy Brew',
  //         flavours: ['chocolate', 'vanilla'],
  //       })
  //       .expect(201)
  //       .then(({ body }) => {
  //         const expectedCoffee = jasmine.objectContaining({
  //           ...body,
  //           flavours: jasmine.arrayContaining(
  //             body.flavours.map((name) => jasmine.objectContaining({ name })),
  //           ),
  //         });
  //         expect(body).toEqual(expectedCoffee);
  //       });
  //   });

  afterAll(async () => {
    await app.close();
  });
});
