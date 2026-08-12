import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    findAll(): Promise<{
        id: number;
        wp_id: number | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        slug: string;
        parent_id: number | null;
        image_url: string | null;
        display_order: number;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        wp_id: number | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        slug: string;
        parent_id: number | null;
        image_url: string | null;
        display_order: number;
    }>;
    create(dto: CreateCategoryDto, adminId: number): Promise<{
        id: number;
        wp_id: number | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        slug: string;
        parent_id: number | null;
        image_url: string | null;
        display_order: number;
    }>;
    update(id: number, dto: UpdateCategoryDto, adminId: number): Promise<{
        id: number;
        wp_id: number | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        slug: string;
        parent_id: number | null;
        image_url: string | null;
        display_order: number;
    }>;
    private mapWriteError;
    private assertParentExists;
    private assertNoCycle;
}
