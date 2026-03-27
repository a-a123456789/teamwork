CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'done');

CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "created_by_user_id" UUID NOT NULL,
    "assignee_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tasks_workspace_id_idx" ON "tasks"("workspace_id");
CREATE INDEX "tasks_assignee_user_id_idx" ON "tasks"("assignee_user_id");
CREATE INDEX "tasks_workspace_id_status_idx" ON "tasks"("workspace_id", "status");

ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_workspace_id_fkey"
FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_created_by_user_id_fkey"
FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_assignee_user_id_fkey"
FOREIGN KEY ("assignee_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
