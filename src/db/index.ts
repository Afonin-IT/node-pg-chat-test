import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { Pool } from 'pg';
import { ENV } from '@/config/env';

const pool = new Pool({
  connectionString: ENV.db.url,
});

export const db = drizzle(pool, { schema });
