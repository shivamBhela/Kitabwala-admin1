import { plainToInstance } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_URL!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_TTL!: string;

  @IsInt()
  @Min(1)
  JWT_REFRESH_TTL_DAYS!: number;

  @IsString()
  @IsNotEmpty()
  TOTP_ENCRYPTION_KEY!: string;

  @IsString()
  @IsNotEmpty()
  ANALYTICS_TIMEZONE!: string;

  @IsInt()
  @Min(1)
  SAME_DAY_CACHE_TTL_SECONDS!: number;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN!: string;
}

// Known dev placeholders from .env.example / earlier scaffolding — reject these
// explicitly rather than relying on length alone, since a placeholder can happen
// to be long enough to pass a length check while still being a publicly-known value.
const KNOWN_PLACEHOLDER_SECRETS = new Set([
  'dev-access-secret-change-me',
  'dev-32-byte-totp-key-change-me!!',
  '__CHANGE_ME__',
]);

const MIN_SECRET_LENGTH: Record<'JWT_ACCESS_SECRET' | 'TOTP_ENCRYPTION_KEY', number> = {
  JWT_ACCESS_SECRET: 32,
  TOTP_ENCRYPTION_KEY: 16,
};

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n${errors.map((e) => e.toString()).join('\n')}`,
    );
  }

  // Strength/placeholder rejection is skipped only in explicit dev-bypass mode outside
  // production — this is what lets local/dev environments keep using the short
  // .env.example-style secrets, while still refusing to boot with them the moment
  // NODE_ENV=production or the bypass flag is off (i.e. once this is meant to be real).
  const bypassActive = config.AUTH_DEV_BYPASS === 'true' && config.NODE_ENV !== 'production';
  if (!bypassActive) {
    for (const key of ['JWT_ACCESS_SECRET', 'TOTP_ENCRYPTION_KEY'] as const) {
      const value = validated[key];
      if (KNOWN_PLACEHOLDER_SECRETS.has(value)) {
        throw new Error(
          `${key} is still a known placeholder value — set a real secret before running outside dev-bypass mode.`,
        );
      }
      if (value.length < MIN_SECRET_LENGTH[key]) {
        throw new Error(
          `${key} must be at least ${MIN_SECRET_LENGTH[key]} characters outside dev-bypass mode (got ${value.length}).`,
        );
      }
    }
  }

  return validated;
}
