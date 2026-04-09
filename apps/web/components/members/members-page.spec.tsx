import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { WorkspaceMemberDetail } from '@teamwork/types';
import type * as ApiClientModule from '@/lib/api/client';
import { ApiError, removeWorkspaceMember, updateWorkspaceMemberRole } from '@/lib/api/client';
import { MembersPage } from '@/components/members/members-page';

jest.mock('@/lib/api/client', () => {
  const actual = jest.requireActual<typeof ApiClientModule>('@/lib/api/client');

  return {
    ...actual,
    updateWorkspaceMemberRole: jest.fn(),
    removeWorkspaceMember: jest.fn(),
  };
});

const mockedUpdateWorkspaceMemberRole = jest.mocked(updateWorkspaceMemberRole);
const mockedRemoveWorkspaceMember = jest.mocked(removeWorkspaceMember);

const MEMBER_ONE: WorkspaceMemberDetail = {
  id: 'membership-owner',
  workspaceId: 'workspace-1',
  userId: 'user-owner',
  role: 'owner',
  createdAt: '2026-04-09T00:00:00.000Z',
  user: {
    id: 'user-owner',
    email: 'owner@example.com',
    displayName: 'Owner Person',
    createdAt: '2026-04-09T00:00:00.000Z',
    updatedAt: '2026-04-09T00:00:00.000Z',
  },
};

const MEMBER_TWO: WorkspaceMemberDetail = {
  id: 'membership-member',
  workspaceId: 'workspace-1',
  userId: 'user-member',
  role: 'member',
  createdAt: '2026-04-09T00:00:00.000Z',
  user: {
    id: 'user-member',
    email: 'member@example.com',
    displayName: 'Member Person',
    createdAt: '2026-04-09T00:00:00.000Z',
    updatedAt: '2026-04-09T00:00:00.000Z',
  },
};

function renderMembersPage(currentUserRole: 'owner' | 'member' | null = 'owner') {
  return render(
    <MembersPage
      workspaceId="workspace-1"
      members={[MEMBER_ONE, MEMBER_TWO]}
      currentUserRole={currentUserRole}
      accessToken="token-123"
    />,
  );
}

function createDeferredPromise<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });

  return { promise, resolve, reject };
}

describe('MembersPage', () => {
  beforeEach(() => {
    mockedUpdateWorkspaceMemberRole.mockReset();
    mockedRemoveWorkspaceMember.mockReset();
  });

  it('shows remove actions for owners', () => {
    renderMembersPage('owner');

    expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(2);
  });

  it('hides remove actions for non-owners', () => {
    renderMembersPage('member');

    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });

  it('removes a member after a successful confirmation flow', async () => {
    const user = userEvent.setup();
    mockedRemoveWorkspaceMember.mockResolvedValue({ success: true });

    renderMembersPage('owner');

    const memberRow = screen.getByTestId('member-row-user-member');
    await user.click(within(memberRow).getByRole('button', { name: 'Remove' }));
    await user.click(screen.getByRole('button', { name: 'Remove Member' }));

    await waitFor(() => {
      expect(mockedRemoveWorkspaceMember).toHaveBeenCalledWith(
        'workspace-1',
        'user-member',
        'token-123',
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId('member-row-user-member')).not.toBeInTheDocument();
    });
  });

  it('keeps the row and shows the error when removal fails', async () => {
    const user = userEvent.setup();
    mockedRemoveWorkspaceMember.mockRejectedValue(
      new ApiError('Workspace must keep at least one owner.', 400),
    );

    renderMembersPage('owner');

    const memberRow = screen.getByTestId('member-row-user-owner');
    await user.click(within(memberRow).getByRole('button', { name: 'Remove' }));
    await user.click(screen.getByRole('button', { name: 'Remove Member' }));

    expect(
      await screen.findByText('Workspace must keep at least one owner.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('member-row-user-owner')).toBeInTheDocument();
  });

  it('disables row actions while removal is pending', async () => {
    const user = userEvent.setup();
    const deferred = createDeferredPromise<{ success: true }>();
    mockedRemoveWorkspaceMember.mockReturnValue(deferred.promise);

    renderMembersPage('owner');

    const memberRow = screen.getByTestId('member-row-user-member');
    await user.click(within(memberRow).getByRole('button', { name: 'Remove' }));
    await user.click(screen.getByRole('button', { name: 'Remove Member' }));

    await waitFor(() => {
      expect(within(memberRow).getByRole('combobox')).toBeDisabled();
      expect(within(memberRow).getByRole('button', { name: 'Removing...' })).toBeDisabled();
      expect(screen.getAllByRole('button', { name: 'Removing...' })).toHaveLength(2);
    });

    deferred.resolve({ success: true });

    await waitFor(() => {
      expect(screen.queryByTestId('member-row-user-member')).not.toBeInTheDocument();
    });
  });

  it('updates roles with the existing role-change behavior', async () => {
    const user = userEvent.setup();
    mockedUpdateWorkspaceMemberRole.mockResolvedValue({
      membership: {
        ...MEMBER_TWO,
        role: 'owner',
      },
    });

    renderMembersPage('owner');

    const memberRow = screen.getByTestId('member-row-user-member');
    await user.selectOptions(within(memberRow).getByRole('combobox'), 'owner');

    await waitFor(() => {
      expect(mockedUpdateWorkspaceMemberRole).toHaveBeenCalledWith(
        'workspace-1',
        'user-member',
        'token-123',
        'owner',
      );
    });

    await waitFor(() => {
      expect(within(screen.getByTestId('member-row-user-member')).getByRole('combobox')).toHaveValue('owner');
    });
  });
});
