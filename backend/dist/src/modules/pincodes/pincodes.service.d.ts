import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateCityDto } from './dto/create-city.dto';
import type { ListCitiesQueryDto } from './dto/list-cities-query.dto';
import type { CreatePincodeDto } from './dto/create-pincode.dto';
import type { UpdatePincodeDto } from './dto/update-pincode.dto';
import type { ListPincodesQueryDto } from './dto/list-pincodes-query.dto';
export interface ImportRowError {
    row: number;
    pincode: string;
    reason: string;
}
export interface ImportSummary {
    totalRows: number;
    imported: number;
    skipped: number;
    failed: number;
    errors: ImportRowError[];
}
export declare class PincodesService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    listCities(query: ListCitiesQueryDto): Promise<any>;
    createCity(dto: CreateCityDto): Promise<any>;
    listPincodes(query: ListPincodesQueryDto): Promise<{
        items: any;
        pagination: {
            page: number;
            pageSize: number;
            total: any;
            totalPages: number;
        };
    }>;
    createPincode(dto: CreatePincodeDto): Promise<any>;
    updatePincode(id: number, dto: UpdatePincodeDto): Promise<any>;
    private resolvePartialCodAmount;
    importCsv(csv: string, adminId: number): Promise<ImportSummary>;
}
