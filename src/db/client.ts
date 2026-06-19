import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

/**
 * Connection string. Defaults to a local Postgres for non-docker dev; the
 * docker-compose stack overrides this with `DATABASE_URL` pointing at the `db`
 * service.
 */
export const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgres://polyshop:polyshop@localhost:5432/polyshop';

export const pool = new Pool({ connectionString: DATABASE_URL });

export const db = drizzle(pool, { schema });
