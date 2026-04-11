CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "revoke_reason" TEXT,
    "replaced_by_session_id" UUID,
    "ip_address_hash" TEXT,
    "user_agent_hash" TEXT,
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "auth_sessions_refresh_token_hash_key"
    ON "auth_sessions" ("refresh_token_hash");

CREATE INDEX "auth_sessions_user_id_revoked_at_expires_at_idx"
    ON "auth_sessions" ("user_id", "revoked_at", "expires_at");

CREATE INDEX "auth_sessions_expires_at_idx"
    ON "auth_sessions" ("expires_at");

ALTER TABLE "auth_sessions"
    ADD CONSTRAINT "auth_sessions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
