import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDTO } from './dto/create-coffee.dto.ts/create-coffee.dto';
import { UpdateCoffeeDTO } from './dto/update-coffee.dto/update-coffee.dto';
import { PaginationQueryDTO } from '../common/dto/pagination-query.dto/pagination-query.dto';
import { log } from 'console';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Controller('coffees')
export class CoffeesController {
  constructor(
    private readonly coffeesService: CoffeesService,
    //Injecting the original request object
    @Inject(REQUEST) private readonly request: Request,
  ) {
    log(
      'Even though the CoffeesController seems to be a Singleton since nothing seems to tell different, since it depends on the CoffeesService, which is a REQUEST scoped service, it will be REQUEST scoped as well.',
    );
    log('CoffeesController instantiated');
  }

  @Get('flavours')
  //   findAll(@Res() response) {
  //     response.status(200).send('Returns all');
  //   }
  findAll(@Query() paginationQuery: PaginationQueryDTO) {
    console.log(paginationQuery);
    // const { limit, offset } = paginationQuery;
    // return 'Returns all where. Limit is ' + limit + ' and offset is ' + offset;
    log(this.request);
    return this.coffeesService.findAll(paginationQuery);
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
