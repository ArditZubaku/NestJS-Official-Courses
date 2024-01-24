/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test } from '@nestjs/testing';
import { CoffeesService } from './coffees.service';
import { ConfigService, ConfigType } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { COFFEE_BRANDS } from './coffees.constants';
import { Coffee } from './entities/coffee.entity';
import { Flavour } from './entities/flavour.entity';
import coffeesConfig from './config/coffees.config';
import { NotFoundException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
});

describe('CoffeesService', () => {
  let service: CoffeesService;
  let coffeeRepository: MockRepository<Coffee>;
  let flavourRepository: MockRepository<Flavour>;
  let connection: DataSource;
  let configService: ConfigService;
  let coffeesConfiguration: ConfigType<typeof coffeesConfig>;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CoffeesService,
        {
          provide: getRepositoryToken(Coffee),
          useValue: createMockRepository<Coffee>(),
        },
        {
          provide: getRepositoryToken(Flavour),
          useValue: createMockRepository<Flavour>(),
        },
        {
          provide: DataSource,
          useValue: {},
        },
        {
          provide: COFFEE_BRANDS,
          useValue: [],
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
          },
        },
        {
          provide: coffeesConfig.KEY,
          useValue: {},
        },
      ],
    }).compile();

    service = moduleRef.get<CoffeesService>(CoffeesService);
    coffeeRepository = moduleRef.get<MockRepository<Coffee>>(
      getRepositoryToken(Coffee),
    );
    flavourRepository = moduleRef.get<MockRepository<Flavour>>(
      getRepositoryToken(Flavour),
    );
    connection = moduleRef.get<DataSource>(DataSource);
    configService = moduleRef.get<ConfigService>(ConfigService);
    coffeesConfiguration = moduleRef.get<ConfigType<typeof coffeesConfig>>(
      coffeesConfig.KEY,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    describe('when coffee with ID exists', () => {
      it('should return the coffee object', async () => {
        const coffeeId = '1';
        const expectedCoffee = {};

        coffeeRepository.findOne.mockReturnValue(expectedCoffee);
        const coffee = await service.findOne(+coffeeId);
        expect(coffee).toEqual(expectedCoffee);
      });
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const coffeeId = '1';

        coffeeRepository.findOne.mockResolvedValue(undefined);

        try {
          await service.findOne(+coffeeId);
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toEqual(`Coffee #${coffeeId} not found`);
        }
      });
    });
  });
});
