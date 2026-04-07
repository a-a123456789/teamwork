import { IsIn } from 'class-validator';
import type { WorkspaceRole } from '@teamwork/types';

export class UpdateWorkspaceShareLinkDto {
  @IsIn(['owner', 'member'])
  role!: WorkspaceRole;
}
