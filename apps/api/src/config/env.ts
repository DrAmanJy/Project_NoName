import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  MONGODB_URI: z.string().url(),

  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),

  EXPECTED_EARNING_AMOUNT: z.coerce.number().int().nonnegative(),

  AUTH_COOKIE_NAME: z.string().default(process.env.NODE_ENV === 'production' ? '__Host-session' : 'session'),
  AUTH_SESSION_TTL_DAYS: z.coerce.number().default(30),
  AUTH_ENCRYPTION_KEY: z.string().refine((val) => Buffer.byteLength(val, 'utf-8') === 32, { message: 'Must be exactly 32 UTF-8 bytes' }),

  AUTH_PUBLIC_URL: z.string().url(),
  AUTH_MOBILE_REDIRECT_URI: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),

  FACEBOOK_APP_ID: z.string().min(1),
  FACEBOOK_APP_SECRET: z.string().min(1),
  FACEBOOK_REDIRECT_URI: z.string().url(),

  APPLE_CLIENT_ID: z.string().min(1),
  APPLE_TEAM_ID: z.string().min(1),
  APPLE_KEY_ID: z.string().min(1),
  APPLE_PRIVATE_KEY: z.string().min(1),
  APPLE_REDIRECT_URI: z.string().url(),

  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_PUBLIC_URL: z.string().url(),

  VIDEO_MAX_SIZE_BYTES: z.coerce.number().default(100 * 1024 * 1024),
  VIDEO_MAX_DURATION_SECONDS: z.coerce.number().default(120),
  VIDEO_MIN_DURATION_SECONDS: z.coerce.number().default(2),
  VIDEO_MAX_WIDTH: z.coerce.number().default(1920),
  VIDEO_MAX_HEIGHT: z.coerce.number().default(1920),
  VIDEO_WORKER_CONCURRENCY: z.coerce.number().default(2),
  VIDEO_PROCESSING_TIMEOUT_SECONDS: z.coerce.number().default(600),
  VIDEO_RETENTION_DAYS: z.coerce.number().default(30),
  AI_ARTIFACT_RETENTION_DAYS: z.coerce.number().default(7),
  VIDEO_UPLOAD_TTL_MINUTES: z.coerce.number().default(60),

  AI_ENABLED: z.enum(['true', 'false', '1', '0']).transform(v => v === 'true' || v === '1').default('false'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_TRANSCRIPTION_MODEL: z.string().default('whisper-1'),
  OPENAI_VISION_MODEL: z.string().default('gpt-4.1-nano'),

  VIDEO_AUTHENTICITY_ENABLED: z.enum(['true', 'false', '1', '0']).transform(v => v === 'true' || v === '1').default('false'),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.format();
    const message = Object.entries(formatted)
      .filter(([key]) => key !== '_errors')
      .map(([key, value]) => {
        const errors = (value as { _errors: string[] })._errors;
        return `  ${key}: ${errors.join(', ')}`;
      })
      .join('\n');

    throw new Error(`❌ Environment validation failed:\n${message}`);
  }

  const data = parsed.data;
  
  if (!data.GOOGLE_REDIRECT_URI) {
    data.GOOGLE_REDIRECT_URI = `${data.AUTH_PUBLIC_URL}/api/v1/auth/google/callback`;
  }
  
  return data as typeof data & { GOOGLE_REDIRECT_URI: string };
}

export const env = validateEnv();
