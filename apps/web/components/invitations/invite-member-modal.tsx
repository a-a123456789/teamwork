'use client';

import { useEffect, useState, type SyntheticEvent } from 'react';
import type { InviteWorkspaceMemberResult, WorkspaceRole } from '@teamwork/types';
import { ApiError, inviteWorkspaceMember } from '@/lib/api/client';
import { isValidEmailAddress } from '@/lib/auth/forms';
import { Dialog } from '@/components/ui/dialog';
import { AppButton } from '@/components/ui/button';
import {
  Field,
  FormMessage,
  getTextControlClassName,
} from '@/components/ui/form-controls';

interface InviteMemberModalProps {
  open: boolean;
  workspaceId: string;
  accessToken: string | null;
  onClose: () => void;
  onCreated: (result: InviteWorkspaceMemberResult) => void;
}

type InviteFormErrors = Partial<Record<'email' | 'form', string>>;

const INITIAL_VALUES = {
  email: '',
  role: 'member' as WorkspaceRole,
};

export function InviteMemberModal({
  open,
  workspaceId,
  accessToken,
  onClose,
  onCreated,
}: InviteMemberModalProps) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState<InviteFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setValues(INITIAL_VALUES);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  const handleSubmit = async () => {
    const email = values.email.trim();

    if (!email) {
      setErrors({ email: 'Email is required.' });
      return;
    }

    if (!isValidEmailAddress(email)) {
      setErrors({ email: 'Enter a valid email address.' });
      return;
    }

    if (!accessToken) {
      setErrors({ form: 'Your session is unavailable. Refresh the page and try again.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await inviteWorkspaceMember(workspaceId, accessToken, {
        email,
        role: values.role,
      });
      onCreated(result);
      onClose();
    } catch (error) {
      setErrors({
        form:
          error instanceof ApiError || error instanceof Error
            ? error.message
            : 'Invitation could not be created.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit();
  };

  return (
    <Dialog
      open={open}
      title="Invite Member"
      description="Send a workspace invitation and share the generated access link."
      onClose={handleClose}
      footer={
        <>
          <AppButton
            onClick={handleClose}
            disabled={isSubmitting}
            variant="secondary"
          >
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            form="invite-member-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Inviting...' : 'Invite Member'}
          </AppButton>
        </>
      }
    >
      <form
        id="invite-member-form"
        className="flex flex-col gap-5"
        onSubmit={handleFormSubmit}
      >
        <Field
          label="Email"
          error={errors.email}
          hint="Send an invitation to this email address."
        >
          <input
            type="email"
            value={values.email}
            autoComplete="email"
            onChange={(event) => {
              const nextEmail = event.target.value;
              setValues((current) => ({
                ...current,
                email: nextEmail,
              }));
              setErrors((current) => {
                if (!current.email && !current.form) {
                  return current;
                }

                const { email: removedEmail, form: removedForm, ...remaining } = current;
                void removedEmail;
                void removedForm;
                return remaining;
              });
            }}
            className={getTextControlClassName(Boolean(errors.email))}
            placeholder="member@example.com"
          />
        </Field>

        <Field
          label="Role"
          hint="Owners can manage members and invitations. Members keep standard workspace access."
        >
          <select
            value={values.role}
            onChange={(event) => {
              const nextRole = readWorkspaceRole(event.target.value);

              if (nextRole) {
                setValues((current) => ({
                  ...current,
                  role: nextRole,
                }));
              }
            }}
            className={getTextControlClassName(false)}
          >
            <option value="member">Member</option>
            <option value="owner">Owner</option>
          </select>
        </Field>

        {errors.form ? <FormMessage message={errors.form} /> : null}
      </form>
    </Dialog>
  );
}

function readWorkspaceRole(value: string): WorkspaceRole | null {
  if (value === 'owner' || value === 'member') {
    return value;
  }

  return null;
}
