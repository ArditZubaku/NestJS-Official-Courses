import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDTO } from './dto/create-coffee.dto.ts/create-coffee.dto';
import { UpdateCoffeeDTO } from './dto/update-coffee.dto/update-coffee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
  ) {}

  findAll() {
    return this.coffeeRepository.find({
      relations: ['flavours'],
    });
  }

  async findOne(id: number) {
    const coffee = this.coffeeRepository.findOne({
      where: {
        id,
      },
      relations: ['flavours'],
    });

    if (!coffee) {
      throw new NotFoundException(`Coffee ${id} not found`);
    }

    return coffee;
  }

  create(createCoffeeDTO: CreateCoffeeDTO) {
    const coffee = this.coffeeRepository.create(createCoffeeDTO);
    return this.coffeeRepository.save(coffee);
  }

  async update(id: number, updateCoffeeDTO: UpdateCoffeeDTO) {
    const coffee = await this.coffeeRepository.preload({
      id: id,
      ...updateCoffeeDTO,
    });

    if (!coffee) {
      throw new NotFoundException(`Coffee ${id} not found`);
    }

    return this.coffeeRepository.save(coffee);
  }

  async remove(id: number) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }
}
