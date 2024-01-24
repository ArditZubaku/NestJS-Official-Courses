import {
  UsePipes,
  ValidationPipe,
  Controller,
  Inject,
  Get,
  Query,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { log } from 'console';
import { Public, PaginationQueryDTO, ParseIntPipe } from '../common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDTO } from './dto/create-coffee.dto';
import { UpdateCoffeeDTO } from './dto/update-coffee.dto';
import { Protocol } from '../common/decorators/protocol.decorator';
import { ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';

// Use instances only when you need to pass some configuration to the class.
// UsePipes(ValidationPipe) -> this is a local pipe, only for this controller
// Use classes instead of instances whenever possible, since Nest will take care of the instantiation and provide the singleton if that is already instantiated.

@ApiTags('Coffees')
@UsePipes(ValidationPipe)
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

  // @ApiResponse({
  //   status: HttpStatus.FORBIDDEN,
  //   description: 'Forbidden.',
  // })
  @ApiTags('Getter')
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  // @SetMetadata('isPublic', true)
  @Public()
  @UsePipes(ValidationPipe)
  @Get('flavours')
  //   findAll(@Res() response) {
  //     response.status(200).send('Returns all');
  //   }
  async findAll(
    @Protocol('https') protocol: string,
    @Query() paginationQuery: PaginationQueryDTO,
  ) {
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log(protocol);

    console.log(paginationQuery);
    // const { limit, offset } = paginationQuery;
    // return 'Returns all where. Limit is ' + limit + ' and offset is ' + offset;
    log(this.request);
    return this.coffeesService.findAll(paginationQuery);
  }

  @ApiTags('Coffees-Getter')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // return 'Returns one' + id;
    console.log('findOne', typeof id);
    return this.coffeesService.findOne(id);
  }

  @Post()
  //   @HttpCode(HttpStatus.GONE)
  create(@Body(ValidationPipe) body: CreateCoffeeDTO) {
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
