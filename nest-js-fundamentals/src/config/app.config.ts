import { env } from 'process';

export default () => ({
  environment: env.NODE_ENV || 'development',
  database: {
    host: env.DATABASE_HOST,
    port: parseInt(env.DATABASE_PORT, 10) || 5432,
  },
});
