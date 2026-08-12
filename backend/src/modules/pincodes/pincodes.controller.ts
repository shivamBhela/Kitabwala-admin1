import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permission } from '../auth/rbac/permissions';
import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { PincodesService } from './pincodes.service';
import { CreateCityDto } from './dto/create-city.dto';
import { ListCitiesQueryDto } from './dto/list-cities-query.dto';
import { CreatePincodeDto } from './dto/create-pincode.dto';
import { UpdatePincodeDto } from './dto/update-pincode.dto';
import { ListPincodesQueryDto } from './dto/list-pincodes-query.dto';
import { ImportPincodesDto } from './dto/import-pincodes.dto';

@Controller('pincodes')
export class PincodesController {
  constructor(private readonly pincodesService: PincodesService) {}

  @Get('cities')
  @RequirePermission(Permission.PINCODES_MANAGE)
  listCities(@Query() query: ListCitiesQueryDto) {
    return this.pincodesService.listCities(query);
  }

  @Post('cities')
  @RequirePermission(Permission.PINCODES_MANAGE)
  createCity(@Body() dto: CreateCityDto) {
    return this.pincodesService.createCity(dto);
  }

  @Get()
  @RequirePermission(Permission.PINCODES_MANAGE)
  listPincodes(@Query() query: ListPincodesQueryDto) {
    return this.pincodesService.listPincodes(query);
  }

  @Post()
  @RequirePermission(Permission.PINCODES_MANAGE)
  createPincode(@Body() dto: CreatePincodeDto) {
    return this.pincodesService.createPincode(dto);
  }

  @Patch(':id')
  @RequirePermission(Permission.PINCODES_MANAGE)
  updatePincode(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePincodeDto) {
    return this.pincodesService.updatePincode(id, dto);
  }

  @Post('import')
  @RequirePermission(Permission.PINCODES_MANAGE)
  importCsv(@Body() dto: ImportPincodesDto, @CurrentUser() user: AuthenticatedUser) {
    return this.pincodesService.importCsv(dto.csv, user.sub);
  }
}
