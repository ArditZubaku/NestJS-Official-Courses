import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

// DataSourceOptions
export const pgConfig: PostgresConnectionOptions = {
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

export const sqliteConfig: SqliteConnectionOptions = {
  type: 'sqlite',
  database: 'db.sqlite',
  entities: ['dist/**/*.entity.js'],
  synchronize: true,
  migrations: ['dist/sqlite/migrations/*.js'],
  migrationsRun: true,
  logger: 'debug',
};
