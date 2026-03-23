import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  WorkspaceRole as PrismaWorkspaceRole,
  type WorkspaceMembership,
} from '@prisma/client';
import { normalizeEmail } from '@teamwork/validation';
import type {
  WorkspaceMembershipSummary,
  WorkspaceRole,
} from '@teamwork/types';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

type MembershipDatabase = Prisma.TransactionClient | PrismaService;

@Injectable()
export class MembershipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createMembership(
    input: {
      workspaceId: string;
      userId: string;
      role: WorkspaceRole;
    },
    db: MembershipDatabase = this.prisma,
  ) {
    try {
      return await db.workspaceMembership.create({
        data: {
          workspaceId: input.workspaceId,
          userId: input.userId,
          role: toPrismaRole(input.role),
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException(
          'The user is already a member of this workspace.',
        );
      }

      throw error;
    }
  }

  async requireMembership(workspaceId: string, userId: string) {
    const membership = await this.prisma.workspaceMembership.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not belong to this workspace.');
    }

    return membership;
  }

  async listWorkspaceMembers(workspaceId: string) {
    const memberships = await this.prisma.workspaceMembership.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    });

    return memberships.map((membership) => ({
      id: membership.id,
      role: membership.role,
      createdAt: membership.createdAt.toISOString(),
      user: this.usersService.toSummary(membership.user),
    }));
  }

  async addMemberByEmail(
    workspaceId: string,
    email: string,
    role: WorkspaceRole,
  ) {
    const user = await this.usersService.findByEmail(normalizeEmail(email));

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const membership = await this.createMembership({
      workspaceId,
      userId: user.id,
      role,
    });

    return {
      ...this.toSummary(membership),
      user: this.usersService.toSummary(user),
    };
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ) {
    const membership = await this.requireMembership(workspaceId, userId);

    if (membership.role === PrismaWorkspaceRole.owner && role !== 'owner') {
      await this.ensureWorkspaceHasAnotherOwner(workspaceId, userId);
    }

    const updatedMembership = await this.prisma.workspaceMembership.update({
      where: { id: membership.id },
      data: { role: toPrismaRole(role) },
      include: { user: true },
    });

    return {
      ...this.toSummary(updatedMembership),
      user: this.usersService.toSummary(updatedMembership.user),
    };
  }

  async removeMember(workspaceId: string, userId: string) {
    const membership = await this.requireMembership(workspaceId, userId);

    if (membership.role === PrismaWorkspaceRole.owner) {
      await this.ensureWorkspaceHasAnotherOwner(workspaceId, userId);
    }

    await this.prisma.workspaceMembership.delete({
      where: { id: membership.id },
    });

    return { success: true };
  }

  toSummary(
    membership: Pick<
      WorkspaceMembership,
      'id' | 'workspaceId' | 'userId' | 'role' | 'createdAt'
    >,
  ): WorkspaceMembershipSummary {
    return {
      id: membership.id,
      workspaceId: membership.workspaceId,
      userId: membership.userId,
      role: membership.role,
      createdAt: membership.createdAt.toISOString(),
    };
  }

  private async ensureWorkspaceHasAnotherOwner(
    workspaceId: string,
    excludedUserId: string,
  ) {
    const ownerCount = await this.prisma.workspaceMembership.count({
      where: {
        workspaceId,
        role: PrismaWorkspaceRole.owner,
        userId: { not: excludedUserId },
      },
    });

    if (ownerCount === 0) {
      throw new BadRequestException('Workspace must keep at least one owner.');
    }
  }
}

function toPrismaRole(role: WorkspaceRole): PrismaWorkspaceRole {
  return role === 'owner'
    ? PrismaWorkspaceRole.owner
    : PrismaWorkspaceRole.member;
}

function isUniqueConstraintError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === 'P2002';
  }

  return false;
}
