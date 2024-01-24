import { PartialType } from '@nestjs/swagger';
import { CreateCoffeeDTO } from './create-coffee.dto';

export class UpdateCoffeeDTO extends PartialType(CreateCoffeeDTO) {}
