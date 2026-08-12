import { OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
export declare class RedisService extends Redis implements OnModuleDestroy {
    private readonly logger;
    constructor();
    getJson<T>(key: string): Promise<T | null>;
    setJson(key: string, value: unknown, ttlSeconds: number): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
