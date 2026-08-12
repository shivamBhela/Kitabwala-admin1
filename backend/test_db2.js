const { PrismaClient } = require('@prisma/client');
async function test() {
  const users = ['neondb_owner', 'neondb', 'postgres', 'default', 'admin', 'root', 'kitabwalah'];
  const hostsAndPasswords = [
    { pass: 'npg_bnFK0P4DYukM', host: 'ep-billowing-boat-aolfixiy-pooler.c-2.ap-southeast-1.aws.neon.tech' },
    { pass: 'npg_o0D4VXBlQLWE', host: 'ep-shy-rain-aofjdcl6-pooler.c-2.ap-southeast-1.aws.neon.tech' }
  ];

  for (const { pass, host } of hostsAndPasswords) {
    for (const user of users) {
      const url = "postgresql://" + user + ":" + pass + "@" + host + "/neondb?sslmode=require";
      const prisma = new PrismaClient({ datasources: { db: { url } } });
      try {
        await prisma.$connect();
        console.log('SUCCESS with', url);
        await prisma.$disconnect();
        process.exit(0);
      } catch (e) {
        // console.log('FAILED for', user);
      }
    }
  }
  console.log('All attempts failed');
}
test();
