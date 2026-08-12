import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface MapMarker {
  id: string;
  type: 'delivery_person';
  lat: number;
  lng: number;
  label: string;
  meta: Record<string, unknown>;
}

@Injectable()
export class MapService {
  private readonly logger = new Logger(MapService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Only DeliveryPerson has real coordinates in the schema today
   * (last_location_lat/lng). Vendor/order/pincode markers need the future
   * India-pincode-database phase (lat/lng per pincode) to have anywhere to
   * read coordinates from — returning them as empty, not fabricated, until then.
   */
  async getMarkers(): Promise<{ markers: MapMarker[] }> {
    try {
      const deliveryPersons = await this.prisma.deliveryPerson.findMany({
        where: { last_location_lat: { not: null }, last_location_lng: { not: null }, is_active: true },
        select: { id: true, name: true, vehicle_type: true, last_location_lat: true, last_location_lng: true, last_location_update: true },
      });

      const markers: MapMarker[] = deliveryPersons.map((person) => ({
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
    } catch (err) {
      // No live database yet (or a transient outage) — an empty map is the
      // honest state here, not an error banner. The real error is still logged.
      this.logger.warn(`Could not load map markers, returning empty: ${(err as Error).message}`);
      return { markers: [] };
    }
  }
}
