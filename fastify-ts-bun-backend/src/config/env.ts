import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv({ quiet: true });

const booleanEnv = z.preprocess((value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }

    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().min(1).default('*'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_PRETTY: booleanEnv.optional(),
  TRUST_PROXY: booleanEnv.default(true),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  METRICS_ENABLED: booleanEnv.default(true),
  TRACE_ENABLED: booleanEnv.default(true),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid environment variables: ${formatted}`);
}

export const env = {
  ...parsed.data,
  LOG_PRETTY: parsed.data.LOG_PRETTY ?? parsed.data.NODE_ENV !== 'production',
};
