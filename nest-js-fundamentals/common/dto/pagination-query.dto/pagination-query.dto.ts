import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDTO {
  // The value comming in from the query is parsed (transformed) as a number
  @IsOptional()
  @IsPositive()
  //   @Type(() => Number)
  limit: number;

  @IsOptional()
  @IsPositive()
  //   @Type(() => Number)
  offset: number;
}
