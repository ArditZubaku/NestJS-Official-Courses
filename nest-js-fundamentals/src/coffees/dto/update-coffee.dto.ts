import { PartialType } from '@nestjs/mapped-types';
import { CreateCoffeeDTO } from './create-coffee.dto';

export class UpdateCoffeeDTO extends PartialType(CreateCoffeeDTO) {}
