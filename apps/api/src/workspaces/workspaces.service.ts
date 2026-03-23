import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  type Workspace,
  type WorkspaceMembership,
} from '@prisma/client';
import type { AuthenticatedWorkspace, WorkspaceSummary } from '@teamwork/types';
import { normalizeWorkspaceName } from '@teamwork/validation';
import { slugify } from '../common/utils/slug.util';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipsService } from '../memberships/memberships.service';

type WorkspaceDatabase = Prisma.TransactionClient | PrismaService;

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membershipsService: MembershipsService,
  ) {}

  async createWorkspace(
    input: { name: string; createdByUserId: string },
    db: WorkspaceDatabase = this.prisma,
  ) {
    const normalizedName = normalizeWorkspaceName(input.name);
    const slug = await this.generateUniqueSlug(normalizedName, db);

    return db.workspace.create({
      data: {
        name: normalizedName,
        slug,
        createdByUserId: input.createdByUserId,
      },
    });
  }

  async listForUser(userId: string): Promise<AuthenticatedWorkspace[]> {
    const memberships = await this.prisma.workspaceMembership.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((membership) =>
      this.toAuthenticatedWorkspace(membership.workspace, membership),
    );
  }

  async getWorkspaceForUser(workspaceId: string, userId: string) {
    const membership = await this.prisma.workspaceMembership.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      include: {
        workspace: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Workspace not found.');
    }

    return this.toAuthenticatedWorkspace(membership.workspace, membership);
  }

  async createWorkspaceForUser(name: string, userId: string) {
    const workspace = await this.createWorkspace({
      name,
      createdByUserId: userId,
    });

    await this.membershipsService.createMembership({
      workspaceId: workspace.id,
      userId,
      role: 'owner',
    });

    return this.getWorkspaceForUser(workspace.id, userId);
  }

  toSummary(
    workspace: Pick<
      Workspace,
      'id' | 'name' | 'slug' | 'createdByUserId' | 'createdAt' | 'updatedAt'
    >,
  ): WorkspaceSummary {
    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      createdByUserId: workspace.createdByUserId,
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString(),
    };
  }

  private toAuthenticatedWorkspace(
    workspace: Workspace,
    membership: WorkspaceMembership,
  ): AuthenticatedWorkspace {
    return {
      ...this.toSummary(workspace),
      membership: this.membershipsService.toSummary(membership),
    };
  }

  private async generateUniqueSlug(
    workspaceName: string,
    db: WorkspaceDatabase,
  ): Promise<string> {
    const baseSlug = slugify(workspaceName) || 'workspace';
    let attempt = 0;

    while (true) {
      const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
      const existingWorkspace = await db.workspace.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existingWorkspace) {
        return slug;
      }

      attempt += 1;
    }
  }
}
