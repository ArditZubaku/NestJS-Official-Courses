import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDTO } from './dto/create-coffee.dto';
import { UpdateCoffeeDTO } from './dto/update-coffee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Flavour } from './entities/flavour.entity';
import { PaginationQueryDTO } from '../common/dto/pagination-query.dto';
import { Event } from '../common/events/event.entity';
import { COFFEE_BRANDS } from './coffees.constants';
import { log } from 'console';
import { ConfigService, ConfigType } from '@nestjs/config';
import coffeesConfig from './config/coffees.config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Coffee as CoffeeDocument } from './schemas/coffee.schema';

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
    // Best practice to use partial registration
    @Inject(coffeesConfig.KEY)
    private readonly coffeesConfiguration: ConfigType<typeof coffeesConfig>,
    @InjectModel(Coffee.name) private readonly coffeeModel: Model<Coffee>,
    @InjectConnection() private readonly mongooseConnection: Connection,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {
    // const coffeesConfig = this.configService.getOrThrow('coffees');

    log(coffeesConfiguration.foo);

    // Generic type declared only if you want to use the chaining methods
    log(this.configService.getOrThrow<number>('DATABASE_HOST'));
    // log(this.configService.getOrThrow<string>('DATABASE_PORT', '5222'));

    log(coffeeBrands);
    log('CoffeesService instantiated');
  }

  findAllMongo(paginationQuery: PaginationQueryDTO) {
    return this.coffeeModel
      .find()
      .skip(paginationQuery.offset)
      .limit(paginationQuery.limit)
      .exec();
  }

  async findAll(paginationQuery: PaginationQueryDTO) {
    const { limit, offset } = paginationQuery;
    const result = await this.coffeeRepository.query(
      `SELECT sqlite_version() AS version`,
    );
    if (result.length > 0 && result[0].version) {
      console.log('SQLite Database');
    } else {
      console.log('PostgreSQL Database');
    }
    return this.coffeeRepository.find({
      relations: {
        flavours: true,
      },
      skip: offset,
      take: limit,
    });
  }

  async findOneMongo(id: string) {
    const coffee = await this.coffeeModel.findOne({ _id: id }).exec();

    if (!coffee) {
      throw new NotFoundException(`Coffee ${id} not found`);
    }

    return coffee;
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

  createMongo(createCoffeeDTO: Omit<CreateCoffeeDTO, 'flavours'>) {
    const coffee = new this.coffeeModel(createCoffeeDTO);

    return coffee.save();
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

  async updateMongo(id: string, updateCoffeeDTO: UpdateCoffeeDTO) {
    const existingCoffee = await this.coffeeModel
      .findOneAndUpdate(
        { _id: id },
        { $set: updateCoffeeDTO },
        // Means -> return the newly updated obj
        { new: true },
      )
      .exec();

    if (!existingCoffee) {
      throw new NotFoundException(`Coffee ${id} not found`);
    }

    return existingCoffee;
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

  async removeMongo(id: string) {
    const coffee = await this.findOneMongo(id);
    return coffee.deleteOne();
  }

  async remove(id: number) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }

  async recommendCoffeeMongo(coffee: CoffeeDocument) {
    const session = await this.mongooseConnection.startSession();
    session.startTransaction();

    try {
      coffee.recommendations++;

      const recommendedEvent = new this.eventModel({
        name: 'recommend_coffee',
        type: 'coffee',
        payload: { coffeeId: coffee.id },
      });

      await recommendedEvent.save({ session });
      await coffee.save({ session });

      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
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
