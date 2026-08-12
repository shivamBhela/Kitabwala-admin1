import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateThemeDto } from './dto/create-theme.dto';
import type { UpdateThemeDto } from './dto/update-theme.dto';
export declare class ThemesService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    findAll(): Promise<{
        id: number;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: Prisma.JsonValue;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: Prisma.JsonValue;
    }>;
    getEffective(): Promise<{
        id: number;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: Prisma.JsonValue;
    } | null>;
    create(dto: CreateThemeDto, adminId: number): Promise<any>;
    update(id: number, dto: UpdateThemeDto, adminId: number): Promise<{
        id: number;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: Prisma.JsonValue;
    }>;
    activate(id: number, adminId: number): Promise<{
        id: number;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: Prisma.JsonValue;
    }>;
}
