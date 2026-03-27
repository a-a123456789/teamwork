import { IsIn } from 'class-validator';
import type { TaskStatus } from '@teamwork/types';

export class UpdateTaskStatusDto {
  @IsIn(['todo', 'in_progress', 'done'])
  status!: TaskStatus;
}
