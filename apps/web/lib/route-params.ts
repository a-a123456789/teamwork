export function readWorkspaceIdFromParams(params: { workspaceId?: string }): string {
  const workspaceId = params.workspaceId;

  if (!workspaceId || workspaceId.trim().length === 0) {
    throw new Error('workspaceId route param is required.');
  }

  return workspaceId;
}
