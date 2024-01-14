import { Injectable, Module } from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CoffeesController } from './coffees.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coffee } from './entities/coffee.entity';
import { Flavour } from './entities/flavour.entity';
import { COFFEE_BRANDS } from './coffees.constants';

// class MockCoffeesService {
//   private coffees = [];

//   async find(options) {
//     return this.coffees;
//   }

//   async findOne(id: number) {
//     return this.coffees.find((coffee) => coffee.id === id);
//   }

//   async save(createCoffeeDTO) {
//     this.coffees.push(createCoffeeDTO);
//     return createCoffeeDTO;
//   }
// }

class ConfigService {}
class DevConfigService {}
class ProdConfigService {}

@Injectable()
export class CoffeeBrandsFactory {
  create() {
    return ['buddy brew', 'nescafe'];
  }
}

@Module({
  // Registering entities
  imports: [TypeOrmModule.forFeature([Coffee, Flavour, Event])],
  controllers: [CoffeesController],
  providers: [
    // {
    //   provide: CoffeesService,
    //   useValue: new MockCoffeesService(),
    // },
    CoffeesService,
    // {
    //   provide: COFFEE_BRANDS,
    //   useValue: ['buddy brew', 'nescafe'],
    // },
    CoffeeBrandsFactory,
    {
      provide: COFFEE_BRANDS,
      useFactory: (coffeeBrandsFactory: CoffeeBrandsFactory) => [
        'buddy brew',
        'nescafe',
        ...coffeeBrandsFactory.create(),
      ],
      inject: [CoffeeBrandsFactory],
    },
    {
      provide: ConfigService,
      useClass:
        process.env.NODE_ENV === 'development'
          ? DevConfigService
          : ProdConfigService,
    },
  ],
  exports: [CoffeesService],
})
export class CoffeesModule {}
