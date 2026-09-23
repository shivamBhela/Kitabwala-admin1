import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    create(dto: CreateCategoryDto, adminId: number): Promise<any>;
    update(id: number, dto: UpdateCategoryDto, adminId: number): Promise<any>;
    private mapWriteError;
    private assertParentExists;
    private assertNoCycle;
}
