import type { Request } from 'express';
import type { WorkspaceMembership } from '@prisma/client';
import type { RequestUser } from './request-user.interface';

export interface AuthenticatedRequest extends Request {
  user: RequestUser;
  workspaceMembership?: WorkspaceMembership;
}
