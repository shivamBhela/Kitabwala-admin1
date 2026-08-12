import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Flat list, not a nested tree — every row carries parent_id so the frontend can build
   * the hierarchy client-side. Arbitrary depth is supported since this is just a plain
   * self-relation walk, not a fixed number of joined levels.
   */
  async findAll() {
    return this.prisma.category.findMany({
      orderBy: [{ parent_id: 'asc' }, { display_order: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto, adminId: number) {
    if (dto.parent_id !== undefined) {
      await this.assertParentExists(dto.parent_id);
    }

    try {
      const category = await this.prisma.category.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          parent_id: dto.parent_id,
          image_url: dto.image_url,
          display_order: dto.display_order,
          is_active: dto.is_active,
        },
      });

      await this.audit.log(adminId, 'category_create', {
        targetTable: 'categories',
        targetId: String(category.id),
        description: `Created category "${category.name}" (${category.slug})`,
        newData: JSON.parse(JSON.stringify(category)),
      });

      return category;
    } catch (err) {
      throw this.mapWriteError(err, dto.slug);
    }
  }

  async update(id: number, dto: UpdateCategoryDto, adminId: number) {
    const existing = await this.findOne(id);

    if (dto.parent_id !== undefined && dto.parent_id !== null) {
      if (dto.parent_id === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }
      await this.assertParentExists(dto.parent_id);
      await this.assertNoCycle(id, dto.parent_id);
    }

    try {
      const updated = await this.prisma.category.update({
        where: { id },
        data: {
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          parent_id: dto.parent_id,
          image_url: dto.image_url,
          display_order: dto.display_order,
          is_active: dto.is_active,
        },
      });

      await this.audit.log(adminId, 'category_update', {
        targetTable: 'categories',
        targetId: String(id),
        description: `Updated category "${existing.name}"`,
        oldData: JSON.parse(JSON.stringify(existing)),
        newData: JSON.parse(JSON.stringify(updated)),
      });

      return updated;
    } catch (err) {
      throw this.mapWriteError(err, dto.slug);
    }
  }

  private mapWriteError(err: unknown, slug?: string): unknown {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return new ConflictException(`Category with slug "${slug}" already exists`);
    }
    return err;
  }

  private async assertParentExists(parentId: number): Promise<void> {
    const parent = await this.prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) {
      throw new BadRequestException(`Parent category ${parentId} does not exist`);
    }
  }

  /**
   * Walks up the ancestor chain from `proposedParentId` to make sure `categoryId` doesn't
   * appear in it — otherwise re-parenting would create a cycle in the category tree.
   */
  private async assertNoCycle(categoryId: number, proposedParentId: number): Promise<void> {
    let currentId: number | null = proposedParentId;
    const visited = new Set<number>();

    while (currentId !== null) {
      if (currentId === categoryId) {
        throw new BadRequestException('This change would create a circular category hierarchy');
      }
      if (visited.has(currentId)) break; // pre-existing cycle unrelated to this change — don't loop forever
      visited.add(currentId);

      const parent: { parent_id: number | null } | null = await this.prisma.category.findUnique({
        where: { id: currentId },
        select: { parent_id: true },
      });
      currentId = parent?.parent_id ?? null;
    }
  }
}
