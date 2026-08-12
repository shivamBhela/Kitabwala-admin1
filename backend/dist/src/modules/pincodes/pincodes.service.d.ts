import { Prisma } from '@prisma/client';
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
    listCities(query: ListCitiesQueryDto): Promise<{
        id: number;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        slug: string;
    }[]>;
    createCity(dto: CreateCityDto): Promise<{
        id: number;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        slug: string;
    }>;
    listPincodes(query: ListPincodesQueryDto): Promise<{
        items: ({
            city: {
                id: number;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                name: string;
                slug: string;
            };
        } & {
            id: number;
            created_at: Date;
            updated_at: Date;
            pincode: string;
            city_id: number;
            delivery_zone: import("@prisma/client").$Enums.DeliveryZone;
            cod_type: import("@prisma/client").$Enums.CodType;
            partial_cod_amount: Prisma.Decimal | null;
            is_same_day_eligible: boolean;
            is_delivery_available: boolean;
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    createPincode(dto: CreatePincodeDto): Promise<{
        city: {
            id: number;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            name: string;
            slug: string;
        };
    } & {
        id: number;
        created_at: Date;
        updated_at: Date;
        pincode: string;
        city_id: number;
        delivery_zone: import("@prisma/client").$Enums.DeliveryZone;
        cod_type: import("@prisma/client").$Enums.CodType;
        partial_cod_amount: Prisma.Decimal | null;
        is_same_day_eligible: boolean;
        is_delivery_available: boolean;
    }>;
    updatePincode(id: number, dto: UpdatePincodeDto): Promise<{
        city: {
            id: number;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            name: string;
            slug: string;
        };
    } & {
        id: number;
        created_at: Date;
        updated_at: Date;
        pincode: string;
        city_id: number;
        delivery_zone: import("@prisma/client").$Enums.DeliveryZone;
        cod_type: import("@prisma/client").$Enums.CodType;
        partial_cod_amount: Prisma.Decimal | null;
        is_same_day_eligible: boolean;
        is_delivery_available: boolean;
    }>;
    private resolvePartialCodAmount;
    importCsv(csv: string, adminId: number): Promise<ImportSummary>;
}
