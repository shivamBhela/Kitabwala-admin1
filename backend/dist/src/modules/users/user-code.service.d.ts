import { Prisma, UserRole } from '@prisma/client';
export declare function generateUserCode(tx: Prisma.TransactionClient, role: UserRole): Promise<string>;
export declare class UserCodeService {
    generate(tx: Prisma.TransactionClient, role: UserRole): Promise<string>;
}
