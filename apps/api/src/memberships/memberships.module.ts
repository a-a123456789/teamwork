import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { MembershipsService } from './memberships.service';

@Module({
  imports: [UsersModule],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
