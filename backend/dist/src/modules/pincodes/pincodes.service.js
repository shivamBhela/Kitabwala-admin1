"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PincodesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const CSV_HEADER = ['pincode', 'city_name', 'delivery_zone', 'cod_type', 'is_same_day_eligible', 'is_delivery_available'];
function parseBooleanCell(raw, defaultValue) {
    const value = (raw ?? '').trim().toLowerCase();
    if (value === '')
        return defaultValue;
    if (value === 'true' || value === '1' || value === 'yes')
        return true;
    if (value === 'false' || value === '0' || value === 'no')
        return false;
    throw new Error(`invalid boolean value "${raw}"`);
}
let PincodesService = class PincodesService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async listCities(query) {
        const where = query.search
            ? { name: { contains: query.search, mode: 'insensitive' } }
            : {};
        return this.prisma.city.findMany({ where, orderBy: { name: 'asc' } });
    }
    async createCity(dto) {
        try {
            return await this.prisma.city.create({ data: { name: dto.name, slug: dto.slug } });
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new common_1.ConflictException(`City with slug "${dto.slug}" already exists`);
            }
            throw err;
        }
    }
    async listPincodes(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const where = {};
        if (query.city_id !== undefined)
            where.city_id = query.city_id;
        if (query.delivery_zone)
            where.delivery_zone = query.delivery_zone;
        if (query.search)
            where.pincode = { contains: query.search };
        const [total, items] = await Promise.all([
            this.prisma.pincode.count({ where }),
            this.prisma.pincode.findMany({
                where,
                include: { city: true },
                orderBy: { id: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ]);
        return {
            items,
            pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
        };
    }
    async createPincode(dto) {
        const city = await this.prisma.city.findUnique({ where: { id: dto.city_id } });
        if (!city)
            throw new common_1.BadRequestException(`City ${dto.city_id} does not exist`);
        const codType = dto.cod_type ?? client_1.CodType.full_cod;
        const partialCodAmount = this.resolvePartialCodAmount(codType, dto.partial_cod_amount);
        try {
            return await this.prisma.pincode.create({
                data: {
                    pincode: dto.pincode,
                    city_id: dto.city_id,
                    delivery_zone: dto.delivery_zone,
                    cod_type: codType,
                    partial_cod_amount: partialCodAmount,
                    is_same_day_eligible: dto.is_same_day_eligible ?? false,
                    is_delivery_available: dto.is_delivery_available ?? true,
                },
                include: { city: true },
            });
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new common_1.ConflictException(`Pincode "${dto.pincode}" already exists`);
            }
            throw err;
        }
    }
    async updatePincode(id, dto) {
        const existing = await this.prisma.pincode.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`Pincode ${id} not found`);
        if (dto.city_id !== undefined) {
            const city = await this.prisma.city.findUnique({ where: { id: dto.city_id } });
            if (!city)
                throw new common_1.BadRequestException(`City ${dto.city_id} does not exist`);
        }
        const codType = dto.cod_type ?? existing.cod_type;
        const partialCodAmount = this.resolvePartialCodAmount(codType, dto.partial_cod_amount, existing);
        try {
            return await this.prisma.pincode.update({
                where: { id },
                data: {
                    pincode: dto.pincode,
                    city_id: dto.city_id,
                    delivery_zone: dto.delivery_zone,
                    cod_type: codType,
                    partial_cod_amount: partialCodAmount,
                    is_same_day_eligible: dto.is_same_day_eligible,
                    is_delivery_available: dto.is_delivery_available,
                },
                include: { city: true },
            });
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new common_1.ConflictException(`Pincode "${dto.pincode}" already exists`);
            }
            throw err;
        }
    }
    resolvePartialCodAmount(codType, suppliedAmount, fallback) {
        if (codType !== client_1.CodType.partial_cod)
            return null;
        if (suppliedAmount !== undefined)
            return suppliedAmount;
        if (fallback?.cod_type === client_1.CodType.partial_cod && fallback.partial_cod_amount !== null) {
            return Number(fallback.partial_cod_amount);
        }
        throw new common_1.BadRequestException('partial_cod_amount is required when cod_type is partial_cod');
    }
    async importCsv(csv, adminId) {
        const lines = csv
            .split(/\r\n|\r|\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
        if (lines.length === 0) {
            throw new common_1.BadRequestException('CSV is empty');
        }
        const header = lines[0].split(',').map((cell) => cell.trim().toLowerCase());
        const headerIsValid = header.length === CSV_HEADER.length && CSV_HEADER.every((col, idx) => header[idx] === col);
        if (!headerIsValid) {
            throw new common_1.BadRequestException(`CSV header must be exactly: ${CSV_HEADER.join(',')}`);
        }
        const dataRows = lines.slice(1);
        const totalRows = dataRows.length;
        const [cities, existingPincodeRows] = await Promise.all([
            this.prisma.city.findMany({ select: { id: true, name: true } }),
            this.prisma.pincode.findMany({ select: { pincode: true } }),
        ]);
        const cityIdByName = new Map(cities.map((c) => [c.name.toLowerCase(), c.id]));
        const existingPincodes = new Set(existingPincodeRows.map((p) => p.pincode));
        const seenInFile = new Set();
        const errors = [];
        let skippedCount = 0;
        const validRows = [];
        dataRows.forEach((line, index) => {
            const rowNumber = index + 2;
            const cells = line.split(',').map((cell) => cell.trim());
            const [pincode, cityNameRaw, zoneRaw, codRaw, sameDayRaw, deliveryAvailableRaw] = cells;
            if (!pincode) {
                errors.push({ row: rowNumber, pincode: '', reason: 'pincode is required' });
                return;
            }
            if (seenInFile.has(pincode)) {
                errors.push({ row: rowNumber, pincode, reason: 'duplicate pincode in file' });
                return;
            }
            seenInFile.add(pincode);
            if (existingPincodes.has(pincode)) {
                skippedCount++;
                return;
            }
            const cityId = cityIdByName.get((cityNameRaw ?? '').toLowerCase());
            if (!cityId) {
                errors.push({ row: rowNumber, pincode, reason: `city not found: "${cityNameRaw ?? ''}"` });
                return;
            }
            const zoneValue = (zoneRaw ?? '').toLowerCase();
            if (!Object.values(client_1.DeliveryZone).includes(zoneValue)) {
                errors.push({ row: rowNumber, pincode, reason: `invalid delivery_zone: "${zoneRaw ?? ''}"` });
                return;
            }
            const codValue = codRaw ? codRaw.toLowerCase() : client_1.CodType.full_cod;
            if (!Object.values(client_1.CodType).includes(codValue)) {
                errors.push({ row: rowNumber, pincode, reason: `invalid cod_type: "${codRaw ?? ''}"` });
                return;
            }
            if (codValue === client_1.CodType.partial_cod) {
                errors.push({
                    row: rowNumber,
                    pincode,
                    reason: 'cod_type "partial_cod" requires partial_cod_amount, which the CSV format does not carry — create or update this pincode individually instead',
                });
                return;
            }
            let isSameDayEligible;
            let isDeliveryAvailable;
            try {
                isSameDayEligible = parseBooleanCell(sameDayRaw, false);
                isDeliveryAvailable = parseBooleanCell(deliveryAvailableRaw, true);
            }
            catch (err) {
                errors.push({ row: rowNumber, pincode, reason: err.message });
                return;
            }
            validRows.push({
                pincode,
                city_id: cityId,
                delivery_zone: zoneValue,
                cod_type: codValue,
                is_same_day_eligible: isSameDayEligible,
                is_delivery_available: isDeliveryAvailable,
            });
        });
        let imported = 0;
        if (validRows.length > 0) {
            await this.prisma.$transaction(async (tx) => {
                const result = await tx.pincode.createMany({ data: validRows });
                imported = result.count;
            });
        }
        const summary = {
            totalRows,
            imported,
            skipped: skippedCount,
            failed: errors.length,
            errors,
        };
        await this.audit.log(adminId, 'pincode_update', {
            targetTable: 'pincodes',
            description: `CSV import: ${summary.imported} imported, ${summary.skipped} skipped, ${summary.failed} failed`,
        });
        return summary;
    }
};
exports.PincodesService = PincodesService;
exports.PincodesService = PincodesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], PincodesService);
//# sourceMappingURL=pincodes.service.js.map