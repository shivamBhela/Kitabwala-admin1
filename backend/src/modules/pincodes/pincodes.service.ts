import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CodType, DeliveryZone, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateCityDto } from './dto/create-city.dto';
import type { ListCitiesQueryDto } from './dto/list-cities-query.dto';
import type { CreatePincodeDto } from './dto/create-pincode.dto';
import type { UpdatePincodeDto } from './dto/update-pincode.dto';
import type { ListPincodesQueryDto } from './dto/list-pincodes-query.dto';

const CSV_HEADER = ['pincode', 'city_name', 'delivery_zone', 'cod_type', 'is_same_day_eligible', 'is_delivery_available'];

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

/** Parses a CSV boolean cell. Blank cells fall back to `defaultValue` (matching the
 *  Prisma column defaults); anything else must be an unambiguous true/false token. */
function parseBooleanCell(raw: string | undefined, defaultValue: boolean): boolean {
  const value = (raw ?? '').trim().toLowerCase();
  if (value === '') return defaultValue;
  if (value === 'true' || value === '1' || value === 'yes') return true;
  if (value === 'false' || value === '0' || value === 'no') return false;
  throw new Error(`invalid boolean value "${raw}"`);
}

@Injectable()
export class PincodesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ---------------------------------------------------------------------------
  // Cities
  // ---------------------------------------------------------------------------

  async listCities(query: ListCitiesQueryDto) {
    const where: Prisma.CityWhereInput = query.search
      ? { name: { contains: query.search, mode: 'insensitive' } }
      : {};
    return this.prisma.city.findMany({ where, orderBy: { name: 'asc' } });
  }

  async createCity(dto: CreateCityDto) {
    try {
      return await this.prisma.city.create({ data: { name: dto.name, slug: dto.slug } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`City with slug "${dto.slug}" already exists`);
      }
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // Pincodes
  // ---------------------------------------------------------------------------

  async listPincodes(query: ListPincodesQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.PincodeWhereInput = {};
    if (query.city_id !== undefined) where.city_id = query.city_id;
    if (query.delivery_zone) where.delivery_zone = query.delivery_zone;
    if (query.search) where.pincode = { contains: query.search };

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

  async createPincode(dto: CreatePincodeDto) {
    const city = await this.prisma.city.findUnique({ where: { id: dto.city_id } });
    if (!city) throw new BadRequestException(`City ${dto.city_id} does not exist`);

    const codType = dto.cod_type ?? CodType.full_cod;
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
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`Pincode "${dto.pincode}" already exists`);
      }
      throw err;
    }
  }

  async updatePincode(id: number, dto: UpdatePincodeDto) {
    const existing = await this.prisma.pincode.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Pincode ${id} not found`);

    if (dto.city_id !== undefined) {
      const city = await this.prisma.city.findUnique({ where: { id: dto.city_id } });
      if (!city) throw new BadRequestException(`City ${dto.city_id} does not exist`);
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
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`Pincode "${dto.pincode}" already exists`);
      }
      throw err;
    }
  }

  /**
   * Enforces the cod_type / partial_cod_amount business rule: an amount is required
   * whenever the *effective* cod_type is partial_cod, and cleared otherwise. This spans
   * two fields (and, on update, the existing row), so it can't be expressed purely via
   * class-validator decorators on the DTO — it's validated here instead.
   */
  private resolvePartialCodAmount(
    codType: CodType,
    suppliedAmount: number | undefined,
    fallback?: { cod_type: CodType; partial_cod_amount: Prisma.Decimal | null },
  ): number | null {
    if (codType !== CodType.partial_cod) return null;
    if (suppliedAmount !== undefined) return suppliedAmount;
    if (fallback?.cod_type === CodType.partial_cod && fallback.partial_cod_amount !== null) {
      return Number(fallback.partial_cod_amount);
    }
    throw new BadRequestException('partial_cod_amount is required when cod_type is partial_cod');
  }

  // ---------------------------------------------------------------------------
  // CSV bulk import
  // ---------------------------------------------------------------------------

  async importCsv(csv: string, adminId: number): Promise<ImportSummary> {
    const lines = csv
      .split(/\r\n|\r|\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      throw new BadRequestException('CSV is empty');
    }

    const header = lines[0].split(',').map((cell) => cell.trim().toLowerCase());
    const headerIsValid = header.length === CSV_HEADER.length && CSV_HEADER.every((col, idx) => header[idx] === col);
    if (!headerIsValid) {
      throw new BadRequestException(`CSV header must be exactly: ${CSV_HEADER.join(',')}`);
    }

    const dataRows = lines.slice(1);
    const totalRows = dataRows.length;

    // Phase 1: validate every row up-front WITHOUT touching the database (aside from
    // these two read-only lookups, done once) — no writes happen until phase 2.
    const [cities, existingPincodeRows] = await Promise.all([
      this.prisma.city.findMany({ select: { id: true, name: true } }),
      this.prisma.pincode.findMany({ select: { pincode: true } }),
    ]);
    const cityIdByName = new Map(cities.map((c) => [c.name.toLowerCase(), c.id]));
    const existingPincodes = new Set(existingPincodeRows.map((p) => p.pincode));

    const seenInFile = new Set<string>();
    const errors: ImportRowError[] = [];
    let skippedCount = 0;
    const validRows: Prisma.PincodeCreateManyInput[] = [];

    dataRows.forEach((line, index) => {
      const rowNumber = index + 2; // +1 for the header row, +1 to make it 1-indexed
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
        // Reported as skipped, not failed — this is not a validation problem.
        skippedCount++;
        return;
      }

      const cityId = cityIdByName.get((cityNameRaw ?? '').toLowerCase());
      if (!cityId) {
        errors.push({ row: rowNumber, pincode, reason: `city not found: "${cityNameRaw ?? ''}"` });
        return;
      }

      const zoneValue = (zoneRaw ?? '').toLowerCase();
      if (!Object.values(DeliveryZone).includes(zoneValue as DeliveryZone)) {
        errors.push({ row: rowNumber, pincode, reason: `invalid delivery_zone: "${zoneRaw ?? ''}"` });
        return;
      }

      const codValue = codRaw ? codRaw.toLowerCase() : CodType.full_cod;
      if (!Object.values(CodType).includes(codValue as CodType)) {
        errors.push({ row: rowNumber, pincode, reason: `invalid cod_type: "${codRaw ?? ''}"` });
        return;
      }
      if (codValue === CodType.partial_cod) {
        // The CSV format has no partial_cod_amount column, so this row can't satisfy
        // the cod_type/partial_cod_amount business rule — fail it with a clear reason
        // rather than silently importing an inconsistent record.
        errors.push({
          row: rowNumber,
          pincode,
          reason:
            'cod_type "partial_cod" requires partial_cod_amount, which the CSV format does not carry — create or update this pincode individually instead',
        });
        return;
      }

      let isSameDayEligible: boolean;
      let isDeliveryAvailable: boolean;
      try {
        isSameDayEligible = parseBooleanCell(sameDayRaw, false);
        isDeliveryAvailable = parseBooleanCell(deliveryAvailableRaw, true);
      } catch (err) {
        errors.push({ row: rowNumber, pincode, reason: (err as Error).message });
        return;
      }

      validRows.push({
        pincode,
        city_id: cityId as number,
        delivery_zone: zoneValue as DeliveryZone,
        cod_type: codValue as CodType,
        is_same_day_eligible: isSameDayEligible,
        is_delivery_available: isDeliveryAvailable,
      });
    });

    // Phase 2: a single transactional insert of only the rows that passed validation.
    // A mid-import crash here rolls back everything; per-row validation failures above
    // never reach this point, so they can never abort it.
    let imported = 0;
    if (validRows.length > 0) {
      await this.prisma.$transaction(async (tx) => {
        const result = await tx.pincode.createMany({ data: validRows });
        imported = result.count;
      });
    }

    const summary: ImportSummary = {
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
}
