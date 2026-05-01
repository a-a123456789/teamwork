# Mixed Flow Benchmarks / deployed

Captured at: 2026-04-16T05:11:17.956Z
API: https://teamwork-x0bz.onrender.com
Flow mix: 60% GET /tasks, 30% GET /workspaces/:workspaceId/tasks, 10% PATCH status

## Test A — realistic active usage

- Connections: 10
- Duration: 60s
- Warmup: 10s
- Total requests: 1887
- Total req/s: 31.45
- Errors: 0
- Non-2xx: 0

| Endpoint | p50 (ms) | p95 (ms) | p99 (ms) | req/s | total requests | errors | non2xx |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| GET /tasks | 297.34 | 591.63 | 713.24 | 19.13 | 1148 | 0 | 0 |
| GET /workspaces/:workspaceId/tasks | 297.28 | 522.7 | 710.39 | 9.32 | 559 | 0 | 0 |
| PATCH /workspaces/:workspaceId/tasks/:taskId/status | 401.77 | 780.25 | 895.66 | 3 | 180 | 0 | 0 |

## Test B — moderate peak usage

- Connections: 20
- Duration: 60s
- Warmup: 10s
- Total requests: 1777
- Total req/s: 29.62
- Errors: 0
- Non-2xx: 0

| Endpoint | p50 (ms) | p95 (ms) | p99 (ms) | req/s | total requests | errors | non2xx |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| GET /tasks | 601.38 | 1015.7 | 1148.11 | 18.1 | 1086 | 0 | 0 |
| GET /workspaces/:workspaceId/tasks | 602.98 | 1006.72 | 1126.21 | 8.8 | 528 | 0 | 0 |
| PATCH /workspaces/:workspaceId/tasks/:taskId/status | 804.92 | 1291.67 | 1436.08 | 2.72 | 163 | 0 | 0 |

