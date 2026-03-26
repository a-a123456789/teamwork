import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEmail, IsIn, IsOptional } from 'class-validator';
import type { WorkspaceRole } from '@teamwork/types';

function trimStringValue({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class AddWorkspaceMemberDto {
  @IsEmail()
  @Transform(trimStringValue)
  email!: string;

  @IsOptional()
  @IsIn(['owner', 'member'])
  role?: WorkspaceRole;
}
