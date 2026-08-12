import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_E0ZnFgNT4Mdu@ep-shy-rain-aofjdcl6-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

async function main() {
  await prisma.$connect();
  console.log('USEDBOOKS DB: Connected OK');
  const tables = await prisma.$queryRaw<{tablename: string}[]>`SELECT tablename FROM pg_tables WHERE schemaname='public' LIMIT 30`;
  console.log('Tables:', tables.map(t => t.tablename).join(', '));
  await prisma.$disconnect();
}

main().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
