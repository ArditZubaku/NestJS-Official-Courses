import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CoffeesModule } from '../../src/coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import appConfig from '../../src/config/app.config';
import * as request from 'supertest';
import { CreateCoffeeDTO } from '../../src/coffees/dto/create-coffee.dto';
import { Flavour } from '../../src/coffees/entities/flavour.entity';

describe('[Feature] Coffees - /coffees', () => {
  const coffee: CreateCoffeeDTO = {
    name: 'Espresso',
    brand: 'Italian Roast',
    flavours: [
      { id: 1, name: 'Chocolate', coffees: [] },
      { id: 2, name: 'Vanilla', coffees: [] },
    ],
  };

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
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );

    await app.init();
  });

  it('Create [POST /]', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/coffees')
      .send(coffee as CreateCoffeeDTO)
      .expect(HttpStatus.CREATED);

    const expectedCoffee = {
      ...coffee,
      description: null,
      id: expect.any(Number),
      recommendations: 0,
      test: 0,
      flavours: expect.arrayContaining(
        coffee.flavours.map(
          () =>
            ({
              id: expect.any(Number),
              name: expect.any(String),
            }) as Flavour,
        ),
      ),
    };

    expect(body).toEqual(expectedCoffee);
  });

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
