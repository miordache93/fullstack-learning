// BOUNDARY: Process environment is untrusted string input.
import { z } from 'zod';

const EnvironmentSchema = z.object({
  // WHAT: Make operational mode explicit and bounded.
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // WHAT: Supply safe host-process defaults while allowing container overrides.
  HOST: z.string().default('localhost'),
  // BOUNDARY: Coerce and bound the string port before socket construction.
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  // BOUNDARY: Start with the one implemented client; MongoDB extends this enum later.
  DATABASE_CLIENT: z.literal('prisma').default('prisma'),
  // SECRET: Require a real URL instead of hiding a production fallback.
  DATABASE_URL: z.string().url(),
  // WHY: Prevent one process from creating an unbounded database load.
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
});

export type AppConfig = {
  nodeEnv: 'development' | 'test' | 'production';
  host: string;
  port: number;
  databaseClient: 'prisma';
  databaseUrl: string;
  databasePoolMax: number;
};

// BOUNDARY: Parse once; pass typed configuration instead of reading process.env everywhere.
export function loadConfig(environment = process.env): AppConfig {
  const parsed = EnvironmentSchema.parse(environment);
  return {
    nodeEnv: parsed.NODE_ENV,
    host: parsed.HOST,
    port: parsed.PORT,
    databaseClient: parsed.DATABASE_CLIENT,
    databaseUrl: parsed.DATABASE_URL,
    databasePoolMax: parsed.DATABASE_POOL_MAX,
  };
}