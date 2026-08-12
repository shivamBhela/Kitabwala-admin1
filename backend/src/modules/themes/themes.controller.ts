import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permission } from '../auth/rbac/permissions';
import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { ThemesService } from './themes.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  // Gated the same as every other admin-portal module for now. If a customer-facing
  // app ever consumes this, `/themes/effective` specifically is the one endpoint that
  // would need to become @Public() — everything else should stay admin-only.
  @Get()
  @RequirePermission(Permission.THEMES_MANAGE)
  findAll() {
    return this.themesService.findAll();
  }

  @Get('effective')
  @RequirePermission(Permission.THEMES_MANAGE)
  getEffective() {
    return this.themesService.getEffective();
  }

  @Get(':id')
  @RequirePermission(Permission.THEMES_MANAGE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.themesService.findOne(id);
  }

  @Post()
  @RequirePermission(Permission.THEMES_MANAGE)
  create(@Body() dto: CreateThemeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.themesService.create(dto, user.sub);
  }

  @Patch(':id')
  @RequirePermission(Permission.THEMES_MANAGE)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateThemeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.themesService.update(id, dto, user.sub);
  }

  @Patch(':id/activate')
  @RequirePermission(Permission.THEMES_MANAGE)
  activate(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.themesService.activate(id, user.sub);
  }
}
