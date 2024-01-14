import { Module } from '@nestjs/common';
import { CoffeeRatingService } from './coffee-rating.service';
import { CoffeesModule } from '../coffees/coffees.module';

@Module({
  // imports: [
  //   DatabaseModule.register({
  //     type: 'postgres',
  //     host: 'localhost',
  //     port: 5555,
  //     username: 'postgres',
  //     password: 'pass123',
  //   }),
  //   CoffeesModule,
  // ],
  imports: [CoffeesModule],
  providers: [CoffeeRatingService],
})
export class CoffeeRatingModule {}
