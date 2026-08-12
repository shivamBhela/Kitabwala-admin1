const { PrismaClient } = require('@prisma/client');
async function test() {
  const strings = [
    'postgresql://neondb_owner:npg_u50AgYpWSUaO@ep-billowing-boat-aolfixiy-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  ];
  for (const url of strings) {
    console.log('Testing', url);
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
      await prisma.$connect();
      console.log('SUCCESS with', url);
      await prisma.$disconnect();
    } catch (e) {
      console.log('FAILED:', e.message);
    }
  }
}
test();
