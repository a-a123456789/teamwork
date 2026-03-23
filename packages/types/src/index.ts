export type ID = string;

export type WorkspaceRole = 'owner' | 'member';

export interface UserSummary {
  id: ID;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMembershipSummary {
  id: ID;
  workspaceId: ID;
  userId: ID;
  role: WorkspaceRole;
  createdAt: string;
}

export interface WorkspaceSummary {
  id: ID;
  name: string;
  slug: string;
  createdByUserId: ID;
  createdAt: string;
  updatedAt: string;
}

export interface AuthenticatedWorkspace extends WorkspaceSummary {
  membership: WorkspaceMembershipSummary;
}

export interface AuthPayload {
  user: UserSummary;
  workspaces: AuthenticatedWorkspace[];
  accessToken: string;
}

export interface RegisterResponse extends AuthPayload {
  workspace: WorkspaceSummary;
  memberships: WorkspaceMembershipSummary[];
}

export interface JwtAccessTokenPayload {
  sub: ID;
  email: string;
  type: 'access';
}
