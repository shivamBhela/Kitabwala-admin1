import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { UsersService } from './users.service';
import { UserCodeService } from './user-code.service';
import { UsersController } from './users.controller';

@Module({
  imports: [AuditModule],
  controllers: [UsersController],
  providers: [UsersService, UserCodeService],
  exports: [UsersService, UserCodeService],
})
export class UsersModule {}
