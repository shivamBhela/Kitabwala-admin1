import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    findAll(): Promise<{
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        wp_id: number | null;
        is_active: boolean;
        updated_at: Date;
        slug: string;
        parent_id: number | null;
        image_url: string | null;
        display_order: number;
    }[]>;
    findOne(id: number): Promise<{
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        wp_id: number | null;
        is_active: boolean;
        updated_at: Date;
        slug: string;
        parent_id: number | null;
        image_url: string | null;
        display_order: number;
    }>;
    create(dto: CreateCategoryDto, adminId: number): Promise<{
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        wp_id: number | null;
        is_active: boolean;
        updated_at: Date;
        slug: string;
        parent_id: number | null;
        image_url: string | null;
        display_order: number;
    }>;
    update(id: number, dto: UpdateCategoryDto, adminId: number): Promise<{
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        wp_id: number | null;
        is_active: boolean;
        updated_at: Date;
        slug: string;
        parent_id: number | null;
        image_url: string | null;
        display_order: number;
    }>;
    private mapWriteError;
    private assertParentExists;
    private assertNoCycle;
}
