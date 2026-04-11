import type { UserSummary } from '@teamwork/types';

export type RequestUser = UserSummary & {
  sessionId?: string;
};
