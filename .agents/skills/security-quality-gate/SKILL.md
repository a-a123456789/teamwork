---
name: security-quality-gate
description: Apply before and after any non-doc code change to perform a deliberate security, correctness, maintainability, and verification scan across the touched area.
---

# Purpose

Force a repeatable security and code-quality review loop every time code is written.

# When to use

Use when:

* editing application code
* editing schema or migrations
* editing API contracts or DTOs
* editing authentication, authorization, or realtime logic
* editing shared utilities or infrastructure code
* changing runtime behavior in any meaningful way

# When not to use

Do not use when:

* making docs-only edits
* making comment-only edits with no behavior impact

# Required behavior

Before coding:

* scan the change for auth, RBAC, ownership, and resource-scope risks
* scan external input paths for validation, normalization, parsing, and error handling needs
* scan response paths for hidden field, secret, token, or internal-state leakage
* scan persistence and query paths for integrity, concurrency, and index implications
* scan maintainability risks such as large functions, duplicated logic, weak naming, or mixed responsibilities
* identify required tests and verification commands before implementation starts

After coding:

* re-scan changed files for authorization gaps, unsafe trust boundaries, and leak paths
* re-scan for nullability, error-path, and edge-case correctness
* re-scan for code quality issues including duplication, dead code, overly broad types, and unclear flow
* verify checks actually ran when applicable
* state residual risks honestly if any remain

# Forbidden behavior

* writing code without first considering security and quality impact
* assuming guards alone are enough for authorization
* leaving external input partially validated
* returning internal models or raw internal errors carelessly
* skipping verification and still claiming the code is production-ready
* hiding known quality or security concerns in the final report

# Delivery checklist

* pre-code security and quality scan performed
* post-code security and quality scan performed
* authorization and input boundaries re-checked
* maintainability and performance concerns reviewed
* lint, typecheck, and tests run when applicable
* remaining risks stated clearly
