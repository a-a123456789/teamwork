---
name: backend-feature-delivery
description: Apply when implementing or modifying backend features, endpoints, service flows, guards, business rules, or module behavior where planning, reading existing code, tests, and verification are required.
---

# Purpose

Enforce disciplined backend implementation.

# When to use

Use when:

* implementing a backend feature
* fixing a backend bug
* extending a module
* changing endpoint behavior
* refactoring backend behavior
* adding services, controllers, guards, or tests

# When not to use

Do not use when:

* changing docs only
* making trivial formatting edits
* making a tiny non-behavioral rename

# Required behavior

Follow this sequence:

1. read existing code
2. understand module and nearby patterns
3. run the `security-quality-gate` pre-code scan
4. update DTOs, contracts, or types where appropriate
5. implement service logic
6. wire controller, module, or guards correctly
7. add or update tests
8. run verification
9. run the `security-quality-gate` post-code scan
10. summarize changes accurately

Additional requirements:

* keep controllers thin
* keep business rules in services
* match existing patterns before introducing new ones
* keep changes scoped
* apply industry-standard readability and maintainability judgment, not just functional correctness

# Forbidden behavior

* coding before reading context
* coding before the required security and quality scan
* inventing new patterns unnecessarily
* burying business rules in controllers
* skipping tests
* claiming completion without verification
* making unrelated edits

# Delivery checklist

* related files read first
* security and quality scan performed before and after implementation
* DTOs or contracts updated where needed
* tests added or updated
* lint, typecheck, and tests run when applicable
* completion summary accurate
