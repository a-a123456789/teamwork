import { IsUUID, ValidateIf } from 'class-validator';

export class UpdateTaskAssigneeDto {
  @ValidateIf((_object, value: unknown) => value !== null)
  @IsUUID()
  assigneeUserId!: string | null;
}
