import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class TwoFactorService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    setup(userId: number, accountLabel: string): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    verifySetup(userId: number, code: string): Promise<{
        backupCodes: string[];
    }>;
    verifyLoginCode(userId: number, code: string): Promise<boolean>;
    isEnabled(userId: number): Promise<boolean>;
}
