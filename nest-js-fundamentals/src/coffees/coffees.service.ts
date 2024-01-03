import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDTO } from './dto/create-coffee.dto.ts/create-coffee.dto';
import { UpdateCoffeeDTO } from './dto/update-coffee.dto/update-coffee.dto';

@Injectable()
export class CoffeesService {
  private id: number = 1;
  private coffees: Coffee[] = [
    {
      id: ++this.id,
      name: 'Shipwreck Roast',
      brand: 'Buddy Brew',
      flavours: ['chocolate', 'vanilla'],
    },
    new Coffee(++this.id, 'Shipwreck Roast', 'Buddy Brew', [
      'chocolate',
      'vanilla',
    ]),
  ];

  findAll() {
    return this.coffees;
  }

  findOne(id: number) {
    const coffee = this.coffees.find((coffee) => coffee.id === id);

    if (!coffee) {
      //   throw new HttpException(`Coffee ${id} not found`, HttpStatus.NOT_FOUND);
      throw new NotFoundException(`Coffee ${id} not found`);
    }

    return coffee;
  }

  create(createCoffeeDTO: CreateCoffeeDTO) {
    this.coffees.push({
      id: ++this.id,
      ...createCoffeeDTO,
    });

    return createCoffeeDTO;
  }

  update(id: number, updateCoffeeDTO: UpdateCoffeeDTO) {
    const existingCoffee = this.findOne(id);
    if (existingCoffee) {
      // update the existing entity
      console.log(updateCoffeeDTO);
    }
  }

  remove(id: string) {
    const coffeeIndex = this.coffees.findIndex((coffee) => coffee.id === +id);
    if (coffeeIndex >= 0) {
      this.coffees.splice(coffeeIndex, 1);
    }
  }
}
