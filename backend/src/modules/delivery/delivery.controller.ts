import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permission } from '../auth/rbac/permissions';
import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { DeliveryService } from './delivery.service';
import { ListDeliveryPersonsQueryDto } from './dto/list-delivery-persons-query.dto';
import { CreateDeliveryPersonDto } from './dto/create-delivery-person.dto';
import { UpdateDeliveryPersonDto } from './dto/update-delivery-person.dto';
import { ListShipmentsQueryDto } from './dto/list-shipments-query.dto';
import { AssignShipmentDto } from './dto/assign-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  // ---------------------------------------------------------------------------
  // Delivery persons
  // ---------------------------------------------------------------------------

  @Get('persons')
  @RequirePermission(Permission.DELIVERY_MANAGE)
  findAllPersons(@Query() query: ListDeliveryPersonsQueryDto) {
    return this.deliveryService.findAllPersons(query);
  }

  @Post('persons')
  @RequirePermission(Permission.DELIVERY_MANAGE)
  createPerson(@Body() dto: CreateDeliveryPersonDto, @CurrentUser() user: AuthenticatedUser) {
    return this.deliveryService.createPerson(dto, user.sub);
  }

  @Patch('persons/:id')
  @RequirePermission(Permission.DELIVERY_MANAGE)
  updatePerson(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDeliveryPersonDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.deliveryService.updatePerson(id, dto, user.sub);
  }

  @Patch('persons/:id/deactivate')
  @RequirePermission(Permission.DELIVERY_MANAGE)
  deactivatePerson(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.deliveryService.deactivatePerson(id, user.sub);
  }

  // ---------------------------------------------------------------------------
  // Shipments
  // ---------------------------------------------------------------------------

  @Get('shipments')
  @RequirePermission(Permission.DELIVERY_MANAGE)
  findAllShipments(@Query() query: ListShipmentsQueryDto) {
    return this.deliveryService.findAllShipments(query);
  }

  @Get('shipments/:id')
  @RequirePermission(Permission.DELIVERY_MANAGE)
  findOneShipment(@Param('id', ParseIntPipe) id: number) {
    return this.deliveryService.findOneShipment(id);
  }

  @Patch('shipments/:id/assign')
  @RequirePermission(Permission.DELIVERY_MANAGE)
  assignShipment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignShipmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.deliveryService.assignShipment(id, dto, user.sub);
  }

  @Patch('shipments/:id/status')
  @RequirePermission(Permission.DELIVERY_MANAGE)
  updateShipmentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShipmentStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.deliveryService.updateShipmentStatus(id, dto, user.sub);
  }

  @Get('shipments/:id/attempts')
  @RequirePermission(Permission.DELIVERY_MANAGE)
  getShipmentAttempts(@Param('id', ParseIntPipe) id: number) {
    return this.deliveryService.getShipmentAttempts(id);
  }
}
