import { Prisma } from '@prisma/client';

type PrismaErrorLike = {
  code?: unknown;
  message?: unknown;
  meta?: {
    target?: unknown;
  } | null;
};

export function isPrismaErrorCode(error: unknown, code: string): boolean {
  return getPrismaErrorCode(error) === code;
}

export function isPrismaUniqueConstraintForField(error: unknown, fieldName: string): boolean {
  return isPrismaErrorCode(error, 'P2002') && prismaErrorTargetsField(error, fieldName);
}

function getPrismaErrorCode(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code;
  }

  if (isPrismaErrorLike(error) && typeof error.code === 'string') {
    return error.code;
  }

  return null;
}

function prismaErrorTargetsField(error: unknown, fieldName: string): boolean {
  if (!isPrismaErrorLike(error)) {
    return false;
  }

  const target = error.meta?.target;

  if (Array.isArray(target)) {
    return target.some((value) => typeof value === 'string' && value.includes(fieldName));
  }

  if (typeof target === 'string') {
    return target.includes(fieldName);
  }

  return typeof error.message === 'string' && error.message.includes(fieldName);
}

function isPrismaErrorLike(error: unknown): error is PrismaErrorLike {
  return typeof error === 'object' && error !== null;
}
