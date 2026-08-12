import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { UpsertAppSettingDto } from './dto/upsert-app-setting.dto';
export interface AppSettingResponse {
    key: string;
    value: string;
    description: string | null;
    updated_at: Date;
}
export declare class AppSettingsService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    private isSecretKey;
    private toResponse;
    findAll(): Promise<AppSettingResponse[]>;
    findOne(key: string): Promise<AppSettingResponse>;
    upsert(key: string, dto: UpsertAppSettingDto, adminId: number): Promise<AppSettingResponse>;
}
