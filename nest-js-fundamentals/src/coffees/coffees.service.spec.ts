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

describe('CoffeesService', () => {
  let service: CoffeesService;
  let coffeeRepository: Repository<Coffee>;
  let flavourRepository: Repository<Flavour>;
  let connection: DataSource;
  let configService: ConfigService;
  let coffeesConfiguration: ConfigType<typeof coffeesConfig>;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CoffeesService,
        {
          provide: getRepositoryToken(Coffee),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Flavour),
          useValue: {},
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
    coffeeRepository = moduleRef.get<Repository<Coffee>>(
      getRepositoryToken(Coffee),
    );
    flavourRepository = moduleRef.get<Repository<Flavour>>(
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
});
