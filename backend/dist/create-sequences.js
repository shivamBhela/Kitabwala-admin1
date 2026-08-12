"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const roles = ['customer', 'vendor', 'admin', 'delivery_person', 'reseller'];
    for (const role of roles) {
        await prisma.$executeRawUnsafe(`CREATE SEQUENCE IF NOT EXISTS user_code_seq_${role} START 1`);
        console.log(`Created sequence user_code_seq_${role}`);
    }
}
main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=create-sequences.js.map