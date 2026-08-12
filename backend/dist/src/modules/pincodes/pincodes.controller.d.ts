import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { PincodesService } from './pincodes.service';
import { CreateCityDto } from './dto/create-city.dto';
import { ListCitiesQueryDto } from './dto/list-cities-query.dto';
import { CreatePincodeDto } from './dto/create-pincode.dto';
import { UpdatePincodeDto } from './dto/update-pincode.dto';
import { ListPincodesQueryDto } from './dto/list-pincodes-query.dto';
import { ImportPincodesDto } from './dto/import-pincodes.dto';
export declare class PincodesController {
    private readonly pincodesService;
    constructor(pincodesService: PincodesService);
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
            partial_cod_amount: import("@prisma/client/runtime/library").Decimal | null;
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
        partial_cod_amount: import("@prisma/client/runtime/library").Decimal | null;
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
        partial_cod_amount: import("@prisma/client/runtime/library").Decimal | null;
        is_same_day_eligible: boolean;
        is_delivery_available: boolean;
    }>;
    importCsv(dto: ImportPincodesDto, user: AuthenticatedUser): Promise<import("./pincodes.service").ImportSummary>;
}
