"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://neondb_owner:npg_E0ZnFgNT4Mdu@ep-shy-rain-aofjdcl6-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
        }
    }
});
async function main() {
    await prisma.$connect();
    console.log('USEDBOOKS DB: Connected OK');
    const tables = await prisma.$queryRaw `SELECT tablename FROM pg_tables WHERE schemaname='public' LIMIT 30`;
    console.log('Tables:', tables.map(t => t.tablename).join(', '));
    await prisma.$disconnect();
}
main().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
//# sourceMappingURL=test-usedbooks-db.js.map