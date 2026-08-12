import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { generateSecret, generateURI, verify } from 'otplib';
import * as bcrypt from 'bcrypt';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

const BACKUP_CODE_COUNT = 8;
const EPOCH_TOLERANCE_SECONDS = 30; // allow ±1 time-step of clock drift between server and authenticator app

function encryptionKey(): Buffer {
  return createHash('sha256').update(process.env.TOTP_ENCRYPTION_KEY as string).digest();
}

function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString('base64');
}

function decryptSecret(encoded: string): string {
  const buffer = Buffer.from(encoded, 'base64');
  const iv = buffer.subarray(0, 12);
  const authTag = buffer.subarray(12, 28);
  const ciphertext = buffer.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async setup(userId: number, accountLabel: string): Promise<{ secret: string; otpauthUrl: string }> {
    const existing = await this.prisma.twoFactorAuth.findUnique({ where: { user_id: userId } });
    if (existing?.is_enabled) {
      throw new BadRequestException('Two-factor authentication is already enabled');
    }

    const secret = generateSecret();
    await this.prisma.twoFactorAuth.upsert({
      where: { user_id: userId },
      create: { user_id: userId, secret: encryptSecret(secret) },
      update: { secret: encryptSecret(secret), is_enabled: false },
    });

    const otpauthUrl = generateURI({ issuer: 'Kitabwalah Admin', label: accountLabel, secret });
    return { secret, otpauthUrl };
  }

  async verifySetup(userId: number, code: string): Promise<{ backupCodes: string[] }> {
    const record = await this.prisma.twoFactorAuth.findUnique({ where: { user_id: userId } });
    if (!record) throw new BadRequestException('Call /auth/2fa/setup first');

    const secret = decryptSecret(record.secret);
    const { valid } = await verify({ token: code, secret, epochTolerance: EPOCH_TOLERANCE_SECONDS });
    if (!valid) {
      throw new UnauthorizedException('Invalid authenticator code');
    }

    const backupCodes = Array.from({ length: BACKUP_CODE_COUNT }, () =>
      randomBytes(5).toString('hex'),
    );
    const backupCodesHash = await Promise.all(backupCodes.map((c) => bcrypt.hash(c, 10)));

    await this.prisma.twoFactorAuth.update({
      where: { user_id: userId },
      data: { is_enabled: true, backup_codes_hash: backupCodesHash },
    });
    await this.audit.log(userId, 'two_factor_enabled', { targetTable: 'two_factor_auth', targetId: String(userId) });

    return { backupCodes };
  }

  /** TOTP code or one-time backup code (consumed on use). */
  async verifyLoginCode(userId: number, code: string): Promise<boolean> {
    const record = await this.prisma.twoFactorAuth.findUnique({ where: { user_id: userId } });
    if (!record?.is_enabled) return false;

    const secret = decryptSecret(record.secret);
    const { valid } = await verify({ token: code, secret, epochTolerance: EPOCH_TOLERANCE_SECONDS });
    if (valid) {
      await this.prisma.twoFactorAuth.update({
        where: { user_id: userId },
        data: { last_used_at: new Date() },
      });
      return true;
    }

    for (const hash of record.backup_codes_hash) {
      if (await bcrypt.compare(code, hash)) {
        await this.prisma.twoFactorAuth.update({
          where: { user_id: userId },
          data: {
            backup_codes_hash: record.backup_codes_hash.filter((h) => h !== hash),
            last_used_at: new Date(),
          },
        });
        return true;
      }
    }

    return false;
  }

  async isEnabled(userId: number): Promise<boolean> {
    const record = await this.prisma.twoFactorAuth.findUnique({ where: { user_id: userId } });
    return record?.is_enabled ?? false;
  }
}
