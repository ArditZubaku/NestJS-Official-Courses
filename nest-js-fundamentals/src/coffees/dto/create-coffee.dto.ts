import { IsString } from 'class-validator';
import { Flavour } from '../entities/flavour.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCoffeeDTO {
  @ApiProperty({ description: 'The name of a coffee.' })
  @IsString()
  readonly name: string;

  @ApiProperty({ description: 'The brand of a coffee.' })
  @IsString()
  readonly brand: string;

  @ApiProperty({ description: 'The flavours of a coffee.' })
  @IsString({ each: true })
  readonly flavours: Flavour[];
}
