import 'server-only';

import { cookies } from 'next/headers';
import type { AuthMeResponse, WorkspaceBoardDataResponse } from '@teamwork/types';
import { parseAuthMeResponse, parseWorkspaceBoardDataResponse } from '@/lib/api/contracts';
import { INITIAL_BOARD_TASK_LIMIT } from '@/lib/board';
import {
  COOKIE_SESSION_MARKER_PREFIX,
  LEGACY_ACCESS_TOKEN_COOKIE_NAME,
} from '@/lib/auth/session-constants';

const SERVER_ACCESS_TOKEN_COOKIE_NAMES = ['teamwork.at', LEGACY_ACCESS_TOKEN_COOKIE_NAME] as const;
const EMPTY_AUTH: AuthMeResponse = {
  user: {
    id: '',
    email: '',
    displayName: '',
    createdAt: '',
    updatedAt: '',
  },
  workspaces: [],
  activeWorkspace: null,
};

export interface InitialAuthSessionSnapshot {
  status: 'authenticated' | 'unauthenticated';
  auth: AuthMeResponse;
  accessToken: string | null;
}

export async function loadInitialAuthSessionSnapshot(): Promise<InitialAuthSessionSnapshot | null> {
  const accessTokenEntry = await readServerAccessToken();

  if (!accessTokenEntry) {
    return null;
  }

  if (accessTokenEntry.source === 'legacy-token') {
    // Keep auth bootstrap non-blocking when the token came from local-storage mirroring.
    return null;
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessTokenEntry.token}`,
      },
      cache: 'no-store',
    });

    if (response.status === 401 || response.status === 403) {
      return {
        status: 'unauthenticated',
        auth: EMPTY_AUTH,
        accessToken: null,
      };
    }

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();
    const auth = parseAuthMeResponse(payload);

    return {
      status: 'authenticated',
      auth,
      accessToken: buildCookieSessionMarker(auth),
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to load initial auth session snapshot.', error);
    }

    return null;
  }
}

export async function loadInitialWorkspaceBoardData(
  workspaceId: string,
): Promise<WorkspaceBoardDataResponse | null> {
  const accessTokenEntry = await readServerAccessToken();

  if (!accessTokenEntry) {
    return null;
  }

  try {
    const searchParams = new URLSearchParams({
      includeMembers: 'false',
      limit: String(INITIAL_BOARD_TASK_LIMIT),
    });
    const response = await fetch(
      `${getApiBaseUrl()}/workspaces/${workspaceId}/board-data?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessTokenEntry.token}`,
        },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();
    return parseWorkspaceBoardDataResponse(payload);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to load initial workspace board data.', error);
    }

    return null;
  }
}

async function readServerAccessToken(): Promise<{
  token: string;
  source: 'api-cookie' | 'legacy-token';
} | null> {
  const cookieStore = await cookies();

  for (const cookieName of SERVER_ACCESS_TOKEN_COOKIE_NAMES) {
    const rawValue = cookieStore.get(cookieName)?.value.trim();

    if (rawValue && rawValue.length > 0) {
      return {
        token: rawValue,
        source: cookieName === 'teamwork.at' ? 'api-cookie' : 'legacy-token',
      };
    }
  }

  return null;
}

function getApiBaseUrl(): string {
  const configuredBaseUrl = process.env['NEXT_PUBLIC_API_BASE_URL']?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.endsWith('/')
      ? configuredBaseUrl.slice(0, -1)
      : configuredBaseUrl;
  }

  return 'http://localhost:3000';
}

function buildCookieSessionMarker(auth: AuthMeResponse): string {
  return `${COOKIE_SESSION_MARKER_PREFIX}:${auth.user.id}:${auth.user.updatedAt}`;
}
