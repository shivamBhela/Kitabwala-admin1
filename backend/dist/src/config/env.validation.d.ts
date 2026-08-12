declare class EnvironmentVariables {
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_TTL: string;
    JWT_REFRESH_TTL_DAYS: number;
    TOTP_ENCRYPTION_KEY: string;
    ANALYTICS_TIMEZONE: string;
    SAME_DAY_CACHE_TTL_SECONDS: number;
    CORS_ORIGIN: string;
}
export declare function validateEnv(config: Record<string, unknown>): EnvironmentVariables;
export {};
