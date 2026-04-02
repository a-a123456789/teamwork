import { Module } from '@nestjs/common';
import { MembershipsModule } from '../memberships/memberships.module';
import { UsersModule } from '../users/users.module';
import { TasksInboxController } from './tasks-inbox.controller';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [MembershipsModule, UsersModule],
  controllers: [TasksInboxController, TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
