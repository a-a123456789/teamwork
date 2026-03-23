export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
export const DISPLAY_NAME_MAX_LENGTH = 80;
export const WORKSPACE_NAME_MAX_LENGTH = 120;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeWorkspaceName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}
