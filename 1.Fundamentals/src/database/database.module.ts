import { DynamicModule, Module } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';

@Module({})
// {
//     providers: [
//       {
//         provide: 'CONNECTION',
//         useValue: new DataSource({
//           type: 'postgres',
//           host: 'localhost',
//           port: 5555,
//         }).initialize(),
//       },
//     ],
//   }
export class DatabaseModule {
  static register(options: DataSourceOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'CONNECTION',
          useValue: new DataSource({
            ...options,
          }).initialize(),
        },
      ],
    };
  }
}
