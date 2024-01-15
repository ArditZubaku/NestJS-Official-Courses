import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDTO } from './dto/create-coffee.dto.ts/create-coffee.dto';
import { UpdateCoffeeDTO } from './dto/update-coffee.dto/update-coffee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Flavour } from './entities/flavour.entity';
import { PaginationQueryDTO } from '../common/dto/pagination-query.dto/pagination-query.dto';
import { Event } from '../common/events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.constants';
import { log } from 'console';
import { ConfigService } from '@nestjs/config';

// @Injectable({ scope: Scope.TRANSIENT })
// @Injectable({ scope: Scope.REQUEST })
@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavour)
    private readonly flavourRepository: Repository<Flavour>,
    private readonly connection: DataSource,
    @Inject(COFFEE_BRANDS) coffeeBrands: string[],
    private readonly configService: ConfigService,
  ) {
    log(this.configService.getOrThrow<string>('DATABASE_HOST'));
    // Generic type declared only if you want to use the chaining methods
    log(this.configService.getOrThrow<number>('DATABASE_HOST'));
    log(this.configService.getOrThrow<string>('DATABASE_PORT', '5222'));

    log(coffeeBrands);
    log('CoffeesService instantiated');
  }

  findAll(paginationQuery: PaginationQueryDTO) {
    const { limit, offset } = paginationQuery;
    return this.coffeeRepository.find({
      relations: {
        flavours: true,
      },
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

  async recommendCoffee(coffe: Coffee) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      coffe.recommendations++;

      const recommendedEvent = new Event();
      recommendedEvent.name = 'recommend_coffee';
      recommendedEvent.type = 'coffee';
      recommendedEvent.payload = { coffeeId: coffe.id };

      await queryRunner.manager.save(coffe);
      await queryRunner.manager.save(recommendedEvent);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
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
