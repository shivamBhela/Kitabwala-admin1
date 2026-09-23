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
    importCsv(dto: ImportPincodesDto, user: AuthenticatedUser): Promise<import("./pincodes.service").ImportSummary>;
}
