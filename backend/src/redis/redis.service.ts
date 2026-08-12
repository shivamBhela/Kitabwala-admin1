import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    super(process.env.REDIS_URL as string, { retryStrategy: () => 5000 });
    // Without a listener, ioredis connection errors become unhandled exceptions
    // and crash the process — log-and-continue instead (matters in AUTH_DEV_BYPASS mode).
    let errorLogged = false;
    this.on('error', (err) => {
      if (!errorLogged) {
        this.logger.warn(`Redis connection error: ${err.message}. Retrying silently in background...`);
        errorLogged = true;
      }
    });
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async onModuleDestroy() {
    this.disconnect();
  }
}
