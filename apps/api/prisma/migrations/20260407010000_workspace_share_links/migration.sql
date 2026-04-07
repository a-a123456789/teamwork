CREATE TABLE "workspace_share_links" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_share_links_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "workspace_share_links_workspace_id_key"
ON "workspace_share_links" ("workspace_id");

CREATE UNIQUE INDEX "workspace_share_links_token_key"
ON "workspace_share_links" ("token");

ALTER TABLE "workspace_share_links"
    ADD CONSTRAINT "workspace_share_links_workspace_id_fkey"
    FOREIGN KEY ("workspace_id")
    REFERENCES "workspaces"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE "workspace_share_links"
    ADD CONSTRAINT "workspace_share_links_created_by_user_id_fkey"
    FOREIGN KEY ("created_by_user_id")
    REFERENCES "users"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE;
