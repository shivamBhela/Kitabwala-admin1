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
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        is_active: boolean;
        updated_at: Date;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: Prisma.JsonValue;
    }[]>;
    findOne(id: number): Promise<{
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        is_active: boolean;
        updated_at: Date;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: Prisma.JsonValue;
    }>;
    getEffective(): Promise<{
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        is_active: boolean;
        updated_at: Date;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: Prisma.JsonValue;
    } | null>;
    create(dto: CreateThemeDto, adminId: number): Promise<any>;
    update(id: number, dto: UpdateThemeDto, adminId: number): Promise<{
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        is_active: boolean;
        updated_at: Date;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: Prisma.JsonValue;
    }>;
    activate(id: number, adminId: number): Promise<{
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        is_active: boolean;
        updated_at: Date;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: Prisma.JsonValue;
    }>;
}
