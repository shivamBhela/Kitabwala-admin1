import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PincodesController } from './pincodes.controller';
import { PincodesService } from './pincodes.service';

@Module({
  imports: [AuditModule],
  controllers: [PincodesController],
  providers: [PincodesService],
})
export class PincodesModule {}
