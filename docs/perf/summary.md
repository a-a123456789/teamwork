# Performance Summary

This report compares baseline and after captures for local and deployed environments.

## Local Delta

- Missing one or both artifacts. Run `pnpm perf:run` for both baseline and after captures before generating summary.

## Deployed Delta

- Baseline capture: 2026-04-14T05:28:05.413Z
- After capture: 2026-04-14T05:41:08.601Z

| Endpoint | Δ p50 ms | Δ p95 ms | Δ p99 ms | Δ req/s | p95 change |
| --- | ---: | ---: | ---: | ---: | ---: |
| GET /tasks | -27 | +38.33 | -11 | +0.74 | +3.56% |
| GET /workspaces/:workspaceId/tasks | -7 | -62 | -100 | +1.1 | -5.94% |
| PATCH /workspaces/:workspaceId/tasks/:taskId/status | -15 | +35.67 | +39 | +0.34 | +2.73% |

- Frontend board ready Δ p50: +3.76ms
- Frontend board ready Δ p95: +68.46ms
- Frontend board ready Δ p99: +108.29ms
- Frontend board ready p95 change: +4.25%

## Resume Bullet Drafts

- Resume bullets are generated after all four artifacts exist (baseline/after x local/deployed).

## Required Artifacts

- baseline-local.json
- baseline-deployed.json
- after-local.json
- after-deployed.json
