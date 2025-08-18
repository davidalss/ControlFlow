import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.smvohmdytczfouslcaju:ExieAFZE1Xb3oyfh@aws-1-sa-east-1.pooler.supabase.com:6543/postgres';
const client = postgres(connectionString);
export const db = drizzle(client, { schema });