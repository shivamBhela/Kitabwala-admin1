import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { isDevBypassActive } from '../common/utils/dev-bypass';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    // DEV_BYPASS: normally a failed connection should crash startup loudly.
    // Temporary exception while no real DATABASE_URL exists yet — remove this
    // branch (and AUTH_DEV_BYPASS everywhere else) once a real DB is wired up.
    // isDevBypassActive() also refuses this in production even if the env var is
    // mistakenly left on — a silently-unreachable DB in prod must crash loudly.
    if (isDevBypassActive()) {
      try {
        await this.$connect();
      } catch (err) {
        this.logger.warn(
          `Database unreachable, continuing in AUTH_DEV_BYPASS mode — no data will persist or load until DATABASE_URL points at a real Postgres instance. (${(err as Error).message})`,
        );
      }
      return;
    }
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
