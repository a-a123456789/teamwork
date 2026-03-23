import { IsIn } from 'class-validator';
import type { WorkspaceRole } from '@teamwork/types';

export class UpdateWorkspaceMemberDto {
  @IsIn(['owner', 'member'])
  role!: WorkspaceRole;
}
