// BOUNDARY: Process environment is untrusted string input.
import { z } from 'zod';

// BOUNDARY: Treat an intentionally blank optional environment value as absent.
const optionalString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().optional(),
);

const EnvironmentSchema = z.object({
  // WHAT: Make operational mode explicit and bounded.
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  // WHAT: Supply safe host-process defaults while allowing container overrides.
  HOST: z.string().default('localhost'),
  // BOUNDARY: Coerce and bound the string port before socket construction.
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  // BOUNDARY: Start with the one implemented client; MongoDB extends this enum later.
  DATABASE_CLIENT: z.enum(['prisma', 'mongoose']).default('prisma'),
  // SECRET: Require the selected MongoDB topology URI from configuration.
  MONGODB_URL: z.string().min(1),
  // SECRET: Require a real URL instead of hiding a production fallback.
  DATABASE_URL: z.string().url(),
  // WHY: Prevent one process from creating an unbounded database load.
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  // WHAT: Parse a comma-separated browser-origin allowlist at startup.
  CORS_ORIGINS: z.string().default('http://localhost:4200'),
  // SECRET: Leave the teaching API key absent locally; require real identity in production.
  API_KEY: optionalString,
  // WHAT: Select the region used by the S3 client and presigner.
  AWS_REGION: z.string().default('eu-central-1'),
  // WHAT: Keep upload capability disabled until a private bucket is configured.
  S3_UPLOAD_BUCKET: optionalString,
});

export type AppConfig = {
  nodeEnv: 'development' | 'test' | 'production';
  host: string;
  port: number;
  // Replace AppConfig's existing literal client type, then add the URI:
  databaseClient: 'prisma' | 'mongoose';
  mongodbUrl: string;
  databaseUrl: string;
  databasePoolMax: number;
  // Add to AppConfig:
  corsOrigins: string[];
  apiKey?: string;
  awsRegion: string;
  s3UploadBucket?: string;
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
    mongodbUrl: parsed.MONGODB_URL,
    databasePoolMax: parsed.DATABASE_POOL_MAX,
    // Add to loadConfig's return value:
    corsOrigins: parsed.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    apiKey: parsed.API_KEY,
    awsRegion: parsed.AWS_REGION,
    s3UploadBucket: parsed.S3_UPLOAD_BUCKET,
  };
}
