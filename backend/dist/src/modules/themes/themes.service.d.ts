import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateThemeDto } from './dto/create-theme.dto';
import type { UpdateThemeDto } from './dto/update-theme.dto';
export declare class ThemesService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    getEffective(): Promise<any>;
    create(dto: CreateThemeDto, adminId: number): Promise<any>;
    update(id: number, dto: UpdateThemeDto, adminId: number): Promise<any>;
    activate(id: number, adminId: number): Promise<any>;
}
