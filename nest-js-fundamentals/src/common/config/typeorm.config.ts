import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

// DataSourceOptions
export const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5555,
  username: 'postgres',
  password: 'pass123',
  database: 'postgres',
  entities: ['dist/**/*.entity.js'],
  // synchronize: true,
  migrations: ['dist/migrations/*.js'],
  // migrationsRun: true,
  logging: true,
};

const dataSource = new DataSource(config);
export default dataSource;
