import { Module } from '@nestjs/common';
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
    {
      provide: COFFEE_BRANDS,
      useValue: ['buddy brew', 'nescafe'],
    },
  ],
  exports: [CoffeesService],
})
export class CoffeesModule {}
