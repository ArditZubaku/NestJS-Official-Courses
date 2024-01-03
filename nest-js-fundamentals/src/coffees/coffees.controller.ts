import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDTO } from './dto/create-coffee.dto.ts/create-coffee.dto';
import { UpdateCoffeeDTO } from './dto/update-coffee.dto/update-coffee.dto';

@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  @Get('flavours')
  //   findAll(@Res() response) {
  //     response.status(200).send('Returns all');
  //   }
  findAll(@Query() paginationQuery) {
    console.log(paginationQuery);
    // const { limit, offset } = paginationQuery;
    // return 'Returns all where. Limit is ' + limit + ' and offset is ' + offset;
    return this.coffeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    // return 'Returns one' + id;
    console.log('findOne', typeof id);
    return this.coffeesService.findOne(id);
  }

  @Post()
  //   @HttpCode(HttpStatus.GONE)
  create(@Body() body: CreateCoffeeDTO) {
    // return body;
    console.log(body instanceof CreateCoffeeDTO);
    console.log(body);

    return this.coffeesService.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCoffeeDTO) {
    console.log(body);
    // return `This updates the ${id} in the database`;
    console.log('update', typeof id);

    return this.coffeesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    // return `This deletes the ${id} in the database`;
    return this.coffeesService.remove(id);
  }
}
