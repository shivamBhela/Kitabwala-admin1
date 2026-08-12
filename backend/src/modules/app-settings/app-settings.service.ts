import { Injectable, NotFoundException } from '@nestjs/common';
import { AppSetting } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { UpsertAppSettingDto } from './dto/upsert-app-setting.dto';

const REDACTED_VALUE = '***redacted***';

export interface AppSettingResponse {
  key: string;
  value: string;
  description: string | null;
  updated_at: Date;
}

@Injectable()
export class AppSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** Keys containing "secret" (case-insensitive) have their value withheld from every response. */
  private isSecretKey(key: string): boolean {
    return key.toLowerCase().includes('secret');
  }

  private toResponse(setting: AppSetting): AppSettingResponse {
    return {
      key: setting.key,
      value: this.isSecretKey(setting.key) ? REDACTED_VALUE : setting.value,
      description: setting.description,
      updated_at: setting.updated_at,
    };
  }

  async findAll(): Promise<AppSettingResponse[]> {
    const settings = await this.prisma.appSetting.findMany({ orderBy: { key: 'asc' } });
    return settings.map((setting) => this.toResponse(setting));
  }

  async findOne(key: string): Promise<AppSettingResponse> {
    const setting = await this.prisma.appSetting.findUnique({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Setting "${key}" not found`);
    }
    return this.toResponse(setting);
  }

  async upsert(key: string, dto: UpsertAppSettingDto, adminId: number): Promise<AppSettingResponse> {
    const existing = await this.prisma.appSetting.findUnique({ where: { key } });

    const setting = await this.prisma.appSetting.upsert({
      where: { key },
      create: { key, value: dto.value, description: dto.description },
      update: { value: dto.value, description: dto.description },
    });

    await this.audit.log(adminId, 'settings_update', {
      targetTable: 'app_settings',
      targetId: key,
      oldData: existing ? { value: existing.value, description: existing.description } : undefined,
      newData: { value: dto.value, description: dto.description ?? null },
    });

    return this.toResponse(setting);
  }
}
