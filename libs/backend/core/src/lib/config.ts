import { z } from 'zod';

const optionalString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().optional(),
);

const EnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  // BOUNDARY: Select infrastructure at process startup, never inside domain services.
  DATABASE_CLIENT: z.enum(['prisma', 'mongoose']).default('prisma'),
  DATABASE_URL: z
    .string()
    .default('postgresql://app:app@localhost:5432/learning'),
  MONGODB_URL: z
    .string()
    .default(
      'mongodb://127.0.0.1:27017/learning?replicaSet=rs0&directConnection=true',
    ),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  CORS_ORIGINS: z.string().default('http://localhost:4200'),
  API_KEY: optionalString,
  AWS_REGION: z.string().default('eu-central-1'),
  S3_UPLOAD_BUCKET: optionalString,
});

export type AppConfig = {
  nodeEnv: 'development' | 'test' | 'production';
  host: string;
  port: number;
  databaseClient: 'prisma' | 'mongoose';
  databaseUrl: string;
  mongodbUrl: string;
  databasePoolMax: number;
  corsOrigins: string[];
  apiKey?: string;
  awsRegion: string;
  s3UploadBucket?: string;
};

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
    corsOrigins: parsed.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    apiKey: parsed.API_KEY,
    awsRegion: parsed.AWS_REGION,
    s3UploadBucket: parsed.S3_UPLOAD_BUCKET,
  };
}
