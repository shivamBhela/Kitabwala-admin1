"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MapService = MapService_1 = class MapService {
    prisma;
    logger = new common_1.Logger(MapService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMarkers() {
        try {
            const deliveryPersons = await this.prisma.deliveryPerson.findMany({
                where: { last_location_lat: { not: null }, last_location_lng: { not: null }, is_active: true },
                select: { id: true, name: true, vehicle_type: true, last_location_lat: true, last_location_lng: true, last_location_update: true },
            });
            const markers = deliveryPersons.map((person) => ({
                id: `delivery_person:${person.id}`,
                type: 'delivery_person',
                lat: Number(person.last_location_lat),
                lng: Number(person.last_location_lng),
                label: person.name,
                meta: {
                    vehicleType: person.vehicle_type,
                    lastUpdate: person.last_location_update,
                },
            }));
            return { markers };
        }
        catch (err) {
            this.logger.warn(`Could not load map markers, returning empty: ${err.message}`);
            return { markers: [] };
        }
    }
};
exports.MapService = MapService;
exports.MapService = MapService = MapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MapService);
//# sourceMappingURL=map.service.js.map