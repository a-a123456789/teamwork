# Phase 1 Security Baseline Hardening

Date: 2026-04-11

## Scope

This phase hardens authentication/session handling and public invitation/share-link token flows before production rollout.

## Implemented Controls

### 1. Session model migration (browser-safe default)

- Added server-backed auth sessions in `auth_sessions` with:
  - hashed refresh token storage
  - expiry and revocation timestamps
  - rotation linkage (`replaced_by_session_id`) for refresh-reuse detection
  - hashed client metadata (`ip_address_hash`, `user_agent_hash`)
- Added httpOnly cookie auth transport:
  - access cookie: `teamwork.at`
  - refresh cookie: `teamwork.rt`
- Updated JWT access tokens to include `sessionId` and reject tokens tied to revoked/expired sessions.
- Frontend auth flow now defaults to cookie sessions and no longer writes access tokens to `localStorage`.
- Kept legacy bearer-token compatibility for non-browser automation/scripts.

### 2. Token lifecycle and invalidation controls

- Added `POST /auth/refresh` for refresh-token rotation.
- Added `POST /auth/logout` for current-session invalidation and cookie clearing.
- Added `POST /auth/logout-all` for full user session invalidation.
- Added refresh-token replay protection behavior:
  - detects rotated token reuse
  - revokes active user sessions on reuse signal

### 3. Invitation/share-link abuse controls

- Added tighter route throttles on public token lookup and token-accept endpoints.
- Added token-format validation guards before database lookup.
- Kept hash-based token lookup (`sha256`) and existing expiry/revocation checks.
- Hardened invitation acceptance with race-safe update semantics (`updateMany` guard) to reduce replay/concurrency acceptance races.
- Added structured security audit event logs for lookup/accept success and failure paths.

## Verification Evidence

Executed checks:

- `pnpm --filter @teamwork/api typecheck`
- `pnpm --filter @teamwork/web typecheck`
- `pnpm --filter @teamwork/api test -- workspace-invitations.service.spec.ts workspace-invitations.controller.spec.ts auth.service.spec.ts auth.controller.spec.ts jwt.strategy.spec.ts`
- `pnpm --filter @teamwork/web test -- components/workspaces/delete-workspace-dialog.spec.tsx components/app-shell/sidebar.spec.tsx`

Result:

- API typecheck: pass
- Web typecheck: pass
- Targeted API auth/invitation tests: pass (76 tests)
- Targeted web auth-session dependent tests: pass (7 tests)

## Exit Criteria Sign-Off

- [x] No critical auth/session findings in baseline implementation review
- [x] Session invalidation/logout hardening implemented
- [x] Token lifecycle controls implemented (short-lived access + refresh rotation + replay handling)
- [x] Invitation/share-link acceptance routes abuse-hardened (throttle + validation + replay/race controls)
- [x] Invitation token flows abuse-tested with targeted unit coverage
- [x] Security checklist completed and signed off for Phase 1

## Deployment Notes

- For cross-site web/api deployments, set:
  - `AUTH_COOKIE_SAME_SITE=none`
  - `AUTH_COOKIE_SECURE=true`
  - `AUTH_COOKIE_DOMAIN` when sharing parent domain cookies is required.
