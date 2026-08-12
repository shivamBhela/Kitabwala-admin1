import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateThemeDto } from './dto/create-theme.dto';
import type { UpdateThemeDto } from './dto/update-theme.dto';

@Injectable()
export class ThemesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.siteTheme.findMany({ orderBy: { created_at: 'desc' } });
  }

  async findOne(id: number) {
    const theme = await this.prisma.siteTheme.findUnique({ where: { id } });
    if (!theme) {
      throw new NotFoundException(`Theme ${id} not found`);
    }
    return theme;
  }

  /**
   * The theme the frontend should actually apply right now: the `is_active` row if
   * it's currently within its optional [valid_from, valid_until] scheduling window,
   * otherwise the `is_default` row, otherwise null (meaning: apply no override at
   * all, fall back to the base theme.css palette as shipped).
   */
  async getEffective() {
    const now = new Date();
    const active = await this.prisma.siteTheme.findFirst({ where: { is_active: true } });
    if (active) {
      const startedOk = !active.valid_from || active.valid_from <= now;
      const notExpired = !active.valid_until || active.valid_until >= now;
      if (startedOk && notExpired) {
        return active;
      }
    }
    return this.prisma.siteTheme.findFirst({ where: { is_default: true } });
  }

  async create(dto: CreateThemeDto, adminId: number) {
    if (dto.valid_from && dto.valid_until && new Date(dto.valid_from) > new Date(dto.valid_until)) {
      throw new BadRequestException('valid_from cannot be after valid_until.');
    }

    let created;
    try {
      created = await this.prisma.$transaction(async (tx) => {
        if (dto.is_default) {
          // Exactly one theme should be the default fallback — unset any existing one first.
          await tx.siteTheme.updateMany({ where: { is_default: true }, data: { is_default: false } });
        }
        return tx.siteTheme.create({
          data: {
            name: dto.name,
            slug: dto.slug,
            description: dto.description,
            colors: dto.colors as Prisma.InputJsonValue,
            is_default: dto.is_default ?? false,
            valid_from: dto.valid_from ? new Date(dto.valid_from) : undefined,
            valid_until: dto.valid_until ? new Date(dto.valid_until) : undefined,
          },
        });
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`A theme with slug "${dto.slug}" already exists.`);
      }
      throw err;
    }

    await this.audit.log(adminId, 'theme_create', {
      targetTable: 'site_themes',
      targetId: String(created.id),
      description: `Created theme "${created.name}" (${created.slug})`,
      newData: { name: created.name, slug: created.slug, is_default: created.is_default },
    });

    return created;
  }

  async update(id: number, dto: UpdateThemeDto, adminId: number) {
    const existing = await this.findOne(id);

    const newValidFrom = dto.valid_from !== undefined ? dto.valid_from : existing.valid_from?.toISOString();
    const newValidUntil = dto.valid_until !== undefined ? dto.valid_until : existing.valid_until?.toISOString();
    if (newValidFrom && newValidUntil && new Date(newValidFrom) > new Date(newValidUntil)) {
      throw new BadRequestException('valid_from cannot be after valid_until.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.is_default) {
        await tx.siteTheme.updateMany({
          where: { is_default: true, id: { not: id } },
          data: { is_default: false },
        });
      }
      return tx.siteTheme.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          colors: dto.colors as Prisma.InputJsonValue | undefined,
          is_default: dto.is_default,
          valid_from: dto.valid_from === null ? null : dto.valid_from ? new Date(dto.valid_from) : undefined,
          valid_until: dto.valid_until === null ? null : dto.valid_until ? new Date(dto.valid_until) : undefined,
        },
      });
    });

    await this.audit.log(adminId, 'theme_update', {
      targetTable: 'site_themes',
      targetId: String(id),
      description: `Updated theme "${existing.name}"`,
      oldData: { name: existing.name, colors: existing.colors, is_default: existing.is_default },
      newData: { name: updated.name, colors: updated.colors, is_default: updated.is_default },
    });

    return updated;
  }

  /** Deactivates every other theme and activates this one, atomically — never two active at once. */
  async activate(id: number, adminId: number) {
    const existing = await this.findOne(id);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.siteTheme.updateMany({ where: { is_active: true }, data: { is_active: false } });
      return tx.siteTheme.update({ where: { id }, data: { is_active: true } });
    });

    await this.audit.log(adminId, 'theme_activate', {
      targetTable: 'site_themes',
      targetId: String(id),
      description: `Activated theme "${existing.name}"`,
      newData: { name: updated.name, valid_from: updated.valid_from, valid_until: updated.valid_until },
    });

    return updated;
  }
}
