import { DB } from './types';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

if (process.env.DATABASE_URL === undefined) {
  throw new Error('Undefined database url');
}
const connectionString = process.env.DATABASE_URL;

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    pool: new Pool({ connectionString }),
  }),
});
