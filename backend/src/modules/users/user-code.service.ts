import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';

const ROLE_PREFIX: Record<UserRole, string> = {
  customer: 'USR',
  vendor: 'VEN',
  admin: 'ADM',
  delivery_person: 'DEL',
  reseller: 'RES',
};

/**
 * Issues a permanent, human-readable user code (e.g. "USR000001") from a
 * per-role Postgres sequence — lock-free and race-safe under concurrent signups.
 * Must be called inside the same transaction as the `user.create` it backs.
 */
export async function generateUserCode(
  tx: Prisma.TransactionClient,
  role: UserRole,
): Promise<string> {
  const seqName = `user_code_seq_${role}`; // whitelisted via the UserRole enum, never raw input
  const rows = await tx.$queryRaw<{ nextval: bigint }[]>(
    Prisma.sql`SELECT nextval(${Prisma.raw(`'${seqName}'`)}::regclass) AS nextval`,
  );
  const next = Number(rows[0].nextval);
  return `${ROLE_PREFIX[role]}${next.toString().padStart(6, '0')}`;
}

@Injectable()
export class UserCodeService {
  generate(tx: Prisma.TransactionClient, role: UserRole): Promise<string> {
    return generateUserCode(tx, role);
  }
}
