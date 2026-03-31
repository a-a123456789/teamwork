CREATE UNIQUE INDEX "workspace_invitations_active_workspace_email_key"
ON "workspace_invitations" ("workspace_id", "email")
WHERE "accepted_at" IS NULL AND "revoked_at" IS NULL;
