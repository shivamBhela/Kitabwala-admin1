import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { ThemesController } from './themes.controller';
import { ThemesService } from './themes.service';

@Module({
  imports: [AuditModule],
  controllers: [ThemesController],
  providers: [ThemesService],
})
export class ThemesModule {}
