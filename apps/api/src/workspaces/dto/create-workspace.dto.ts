import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { WORKSPACE_NAME_MAX_LENGTH } from '@teamwork/validation';

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(WORKSPACE_NAME_MAX_LENGTH)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  )
  name!: string;
}
