import { AdminActionType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
interface LogDetails {
    targetTable?: string;
    targetId?: string;
    description?: string;
    oldData?: Prisma.InputJsonValue;
    newData?: Prisma.InputJsonValue;
}
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(adminId: number, actionType: AdminActionType, details?: LogDetails): Promise<void>;
}
export {};
