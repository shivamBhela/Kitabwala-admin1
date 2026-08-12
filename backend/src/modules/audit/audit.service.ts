import { Injectable } from '@nestjs/common';
import { AdminActionType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface LogDetails {
  targetTable?: string;
  targetId?: string;
  description?: string;
  oldData?: Prisma.InputJsonValue;
  newData?: Prisma.InputJsonValue;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(adminId: number, actionType: AdminActionType, details: LogDetails = {}): Promise<void> {
    await this.prisma.adminActionLog.create({
      data: {
        admin_id: adminId,
        action_type: actionType,
        target_table: details.targetTable,
        target_id: details.targetId,
        description: details.description,
        old_data: details.oldData,
        new_data: details.newData,
      },
    });
  }
}
