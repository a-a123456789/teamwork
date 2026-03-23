import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional } from 'class-validator';
import type { WorkspaceRole } from '@teamwork/types';

export class AddWorkspaceMemberDto {
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  email!: string;

  @IsOptional()
  @IsIn(['owner', 'member'])
  role?: WorkspaceRole;
}
