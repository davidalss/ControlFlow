import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:123@localhost:5432/controlflow_db';
const client = postgres(connectionString);
export const db = drizzle(client, { schema });