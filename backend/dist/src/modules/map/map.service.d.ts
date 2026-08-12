import { PrismaService } from '../../prisma/prisma.service';
export interface MapMarker {
    id: string;
    type: 'delivery_person';
    lat: number;
    lng: number;
    label: string;
    meta: Record<string, unknown>;
}
export declare class MapService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getMarkers(): Promise<{
        markers: MapMarker[];
    }>;
}
