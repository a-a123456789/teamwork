'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthSession } from '@/lib/auth/auth-session-provider';

interface UseAuthenticatedApiResourceOptions<T> {
  key: string;
  load: (accessToken: string) => Promise<T>;
}

type ResourceState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: Error };

interface StoredResourceState {
  requestKey: string | null;
  status: 'loading' | 'success' | 'error';
}

type StoredLoadingState = StoredResourceState & {
  status: 'loading';
  data: null;
  error: null;
};

type StoredSuccessState<T> = StoredResourceState & {
  requestKey: string;
  status: 'success';
  data: T;
  error: null;
};

type StoredErrorState = StoredResourceState & {
  requestKey: string;
  status: 'error';
  data: null;
  error: Error;
};

type StoredResourceResult<T> = StoredLoadingState | StoredSuccessState<T> | StoredErrorState;

export function useAuthenticatedApiResource<T>({
  key,
  load,
}: UseAuthenticatedApiResourceOptions<T>): ResourceState<T> {
  const { status, accessToken } = useAuthSession();
  const [state, setState] = useState<StoredResourceResult<T>>({
    requestKey: null,
    status: 'loading',
    data: null,
    error: null,
  });

  const resolveResource = useCallback(
    async (token: string): Promise<ResourceState<T>> => {
      try {
        const data = await load(token);
        return {
          status: 'success',
          data,
          error: null,
        };
      } catch (error) {
        return {
          status: 'error',
          data: null,
          error: error instanceof Error ? error : new Error('Request failed.'),
        };
      }
    },
    [load],
  );

  useEffect(() => {
    let isActive = true;

    if (status !== 'authenticated' || !accessToken) {
      return () => {
        isActive = false;
      };
    }

    void resolveResource(accessToken).then((nextState) => {
      if (!isActive) {
        return;
      }

      setState({
        requestKey: key,
        ...nextState,
      });
    });

    return () => {
      isActive = false;
    };
  }, [accessToken, key, resolveResource, status]);

  if (
    status !== 'authenticated' ||
    !accessToken ||
    state.requestKey !== key ||
    state.status === 'loading'
  ) {
    return {
      status: 'loading',
      data: null,
      error: null,
    };
  }

  if (state.status === 'error') {
    return {
      status: 'error',
      data: null,
      error: state.error,
    };
  }

  return {
    status: 'success',
    data: state.data,
    error: null,
  };
}
