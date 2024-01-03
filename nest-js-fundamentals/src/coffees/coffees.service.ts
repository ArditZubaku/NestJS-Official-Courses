import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDTO } from './dto/create-coffee.dto.ts/create-coffee.dto';
import { UpdateCoffeeDTO } from './dto/update-coffee.dto/update-coffee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flavour } from './entities/flavour.entity';
import { PaginationQueryDTO } from '../../common/dto/pagination-query.dto/pagination-query.dto';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavour)
    private readonly flavourRepository: Repository<Flavour>,
  ) {}

  findAll(paginationQuery: PaginationQueryDTO) {
    const { limit, offset } = paginationQuery;
    return this.coffeeRepository.find({
      relations: ['flavours'],
      skip: offset,
      take: limit,
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

  async create(createCoffeeDTO: CreateCoffeeDTO) {
    const flavours = await Promise.all(
      createCoffeeDTO.flavours.map((flavour) =>
        this.preloadFlavourByName(flavour.name),
      ),
    );

    const coffee = this.coffeeRepository.create({
      ...createCoffeeDTO,
      flavours,
    });

    return this.coffeeRepository.save(coffee);
  }

  async update(id: number, updateCoffeeDTO: UpdateCoffeeDTO) {
    const flavours =
      updateCoffeeDTO.flavours &&
      (await Promise.all(
        updateCoffeeDTO.flavours.map((flavour) =>
          this.preloadFlavourByName(flavour.name),
        ),
      ));

    const coffee = await this.coffeeRepository.preload({
      id: id,
      ...updateCoffeeDTO,
      flavours,
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

  private async preloadFlavourByName(name: string): Promise<Flavour> {
    const existingFlavour = await this.flavourRepository.findOne({
      where: {
        name,
      },
    });

    if (existingFlavour) {
      return existingFlavour;
    }
    return this.flavourRepository.create({
      name,
    });
  }
}
