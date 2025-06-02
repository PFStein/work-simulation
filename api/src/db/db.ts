import { DB } from './types';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';


const dbUrl = process.env.NODE_ENV === 'test'
  ? `${process.env.DATABASE_URL}_test`
  : process.env.DATABASE_URL;

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: dbUrl,
    }),
  }),
});
