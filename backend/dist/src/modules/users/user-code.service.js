"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCodeService = void 0;
exports.generateUserCode = generateUserCode;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const ROLE_PREFIX = {
    customer: 'USR',
    vendor: 'VEN',
    admin: 'ADM',
    delivery_person: 'DEL',
    reseller: 'RES',
};
async function generateUserCode(tx, role) {
    const seqName = `user_code_seq_${role}`;
    const rows = await tx.$queryRaw(client_1.Prisma.sql `SELECT nextval(${client_1.Prisma.raw(`'${seqName}'`)}::regclass) AS nextval`);
    const next = Number(rows[0].nextval);
    return `${ROLE_PREFIX[role]}${next.toString().padStart(6, '0')}`;
}
let UserCodeService = class UserCodeService {
    generate(tx, role) {
        return generateUserCode(tx, role);
    }
};
exports.UserCodeService = UserCodeService;
exports.UserCodeService = UserCodeService = __decorate([
    (0, common_1.Injectable)()
], UserCodeService);
//# sourceMappingURL=user-code.service.js.map