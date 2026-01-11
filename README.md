# capslock-qa-assignment

Test task for QA Lead position at CapsLock.

As a QA Lead, my primary responsibility is risk management and signal clarity rather than raw test count. This suite focuses on protecting business-critical risks (conversion, data quality, and hard business rules) while intentionally limiting test count and scope to maintain fast feedback and low maintenance cost.

This repository contains a focused Playwright (TypeScript) test suite covering the most critical user flows and validations for the “Walk-In Bath” quiz form.

The goal of this assignment is not to build a large framework, but to demonstrate:
	• test design & prioritization
	• understanding of product requirements
	• ability to detect and document defects
	• maintainable, CI-ready automation

⸻

## 1. Running the Project

### Install dependencies
```bash
npm ci
npm run install:pw
```

### Run tests (headless)
```bash
npm run test
```
Optional (override base URL): 
```bash
BASE_URL=<your-environment-url>  npm run test```

### Open Playwright UI mode (manual test execution)
```bash
npm run test:ui
```
Optional (override base URL): 
```bash
BASE_URL=<your-environment-url>  npm run test:ui```

### Linting & formatting
```bash
npm run lint:fix
npm run format
```
### Show Playwright report (local)
```bash
npm run report
```
⸻

## 2. Highest-Priority Scenarios (Implemented)

Selected 5 priority tests.
	1. Happy path → successful submission → Thank You page
	2. Out-of-area ZIP flow
	3. HTML5 email validation
	4. Phone validation (exactly 10 digits)
	5. Property restriction (Rental / Mobile must be blocked)

### Prioritization logic
Incorrect contact data directly affects call center efficiency, lead cost, 
and customer experience, therefore email and phone validation were treated 
as first-class risks.

This landing page exists to generate leads and convert users into callbacks:
	• These flows directly affect lead quality, conversion, and data correctness
	• Validation rules are explicitly stated in the assignment
	• Property restriction is a hard business rule
	• Each test represents a complete end-to-end scenario
	• Tests are stable, deterministic, and suitable for CI

Visual styling, colors, and pixel-perfect layout checks were intentionally 
excluded, as they provide lower ROI compared to functional and validation coverage 
for this type of landing page.

### Test Coverage Analysis

The following sections represent a complete automation coverage map for this landing page.

    Functional flows:
        • Successful submission
        • Out-of-area ZIP flow
        • Property type restriction
        • Multi-step navigation
        • Lightweight smoke tests for critical paths
    Validations:
        • ZIP format
        • Email validation
        • Phone validation
        • Required fields
    UI / UX:
        • Progress bar
        • Step counters
        • Error messages
        • UI consistency checks (visibility, layout stability, critical visual regressions)
        • UI end-to-end tests (positive and negative scenarios)
    Technical:
        • Network request correctness
        • API tests (lead submission, validation, integrations)
        • No critical 404s
    Performance:
        • Basic performance / load checks

The test suite was intentionally limited to five scenarios to demonstrate prioritization under constraints.
In a production environment, I would expand coverage incrementally based on real defect data, conversion metrics, and change frequency.

⸻

## 3. Discovered Defects

All tests are implemented according to **expected behavior**, not current behavior.
For some defects, the exact expected behavior requires clarification of business requirements or design decisions; in such cases, the issue is described using actual behavior and its impact.

### Defect 1. Rental / Mobile is not blocked on Step 3
**Actual:** user can proceed to Step 4
**Expected:** user is blocked with message  
  “Unfortunately, we don’t install walk-in tubs in rental and mobile homes.”
**Evidence:** `data-error-text="Unfortunately, we don't install walk-in tubs in rental and mobile homes."`
**Test handling:** marked as expected failure  
  `test.fail(true, 'Known bug: rental/mobile are allowed to proceed');`
**Impact:** leads are generated for unsupported property types, wasting call center time and inflating lead acquisition costs.
**Severity:**  High
**Priority:**  P0

### Defect 2. Out-of-area email lacks HTML5 validation
**Actual:** `type="text"` is used
**Expected:** email field uses `input type="email"`
**Result:** invalid emails can be submitted, causing inconsistent validation rules across flows.
**Test handling:** marked as expected failure  
  `test.fail(true, 'Known bug: out-of-area email input is type="text" (no HTML5 validation)');`
**Impact:** invalid or malformed emails may reach the CRM, reducing callback success rate and increasing manual cleanup.
**Severity:**  High
**Priority:**  P0

**One product → one set of rules → one behavior.**

### Defect 3. Incorrect step numbering
**Actual:** Step 3 shows “2 of 5”, next step 4 jumps to “4 of 5”
**Expected:** Step “3 of 5”
**Evidence:** `data-form-progress-current-step = 2` while `data-current-step=".step-3"`
**Impact:** inconsistent progress indicators can confuse users and reduce completion rate; also indicates unsynchronized UI state.
**Severity:**  Medium
**Priority:**  P2

### Defect 4. Out-of-area incorrect step numbering
**Actual:** Step indicator shows “Step 1 of …” without total count
**Evidence:** `data-form-progress-total-steps` does not contain the total number of steps
**Impact:** inconsistent progress indicators may confuse users and reduce completion rate for out-of-area flows.
**Severity:**  Low
**Priority:**  P3

### Defect 5. Progress bar has two sources of truth
**Actual:** Progress bar has non-synchronized values
**Evidence:** `style="width: XX%"` (dynamic) and `data-current-progress="XX"` (static) are not synchronized
Step 2 of 5 has `style="width: 36%" data-current-progress="20"`
Step 4 of 5 has `style="width: 52%" data-current-progress="20"`
**Impact:** higher regression risk and inconsistent UI state during future changes, making the component harder to maintain and test.
**Severity:**  Medium
**Priority:**  P2

### Defect 6. Out-of-area progress is stuck
**Actual:** Progress bar is stuck, each step always shows 20%
**Evidence:** `data-current-progress="20"` (static) and `style="width: 20%"` (dynamic)
**Impact:** regression risk and inconsistent UI state during future changes, making the component harder to maintain and test.
**Severity:**  Low
**Priority:**  P3

### Defect 7. Thank You page is directly accessible
**Actual:** `/thankyou` can be opened without completing the form
**Expected:** page should be accessible only after a successful submission
**Impact:** can generate false-positive conversions and pollute analytics, making marketing performance metrics unreliable.
**Suggested fix:** gate access via server-side session/submission token and trigger conversion events only after backend success.
**Severity:**  High
**Priority:**  P0

### Defect 8. Phone number edge cases / unclear rules
**Actual:** input cannot start with `1`, but can start with `0`
**Expected:** phone validation rules should be consistent and aligned with the target region requirements (e.g., NANP for US numbers).
**Impact:** inconsistent validation may lead to unreachable leads or unnecessary follow-up attempts.
**Severity:**  Medium
**Priority:**  P1

⸻

## 4. Future Improvements (Framework & Process)

If this project were continued in a production environment, I would focus on the following improvements with the highest ROI:
	1. Structure & maintainability
	    • Split the codebase into clear layers (Page Objects, domain flows, fixtures/test data, reusable assertions).
	    • Introduce a small “form flow” layer to keep tests readable and reduce duplication.
    Value: faster onboarding, easier reviews, and lower maintenance cost as the number of landing pages grows.
	2. Layered testing strategy (shift-left & faster feedback)
	    • Define a clear test pyramid for landing pages (API-first validation rules, thin UI E2E layer for critical paths).
	    • Use UI tests primarily for business flows and cross-component validation, not for exhaustive rule checking.
	    • Move stable validation rules and integrations closer to the API level where possible.
    Value: faster feedback, reduced flakiness, clearer ownership of failures, and lower maintenance cost as the suite scales.
	3. Reusable landing-page automation toolkit (shared npm package)
	    • Extract common selectors, form flows, validation helpers, and network assertions into an internal npm package.
	    • Standardize conventions (selectors, error handling, logging, retries strategy).
    Value: consistent quality across many similar landing pages, less copy-paste, much quicker rollout of new tests.
	4. Quality signals & reporting integration
	    • Integrate results with test management (TestRail / Zephyr) and CI dashboards for trends (pass rate, flaky tests, duration).
	    • Add email delivery checks via MailTrap when the product relies on email communication.
    Value: better visibility for stakeholders, faster triage, and measurable quality health over time.

**Note on visual testing:** for frequently changing marketing landing pages, pixel-perfect visual regression tends to have low ROI and high maintenance. I would apply visual checks only to stable, high-impact UI components (or use lightweight layout sanity checks rather than full screenshot baselines).

### Quality ownership & team enablement
Establish clear ownership for quality signals (manual QA, automation, product, engineering), supported by lightweight guidelines and shared risk reviews.
The goal is to make quality a team responsibility, not a QA bottleneck.
This would close the loop between automation, QA process, and business visibility.

⸻

## 5. CI

GitHub Actions pipeline:
The pipeline is designed to fail fast on linting issues and critical flow regressions, providing fast feedback before changes reach production.

Tests are written to be fully parallel-safe.
CI execution is intentionally limited to a single worker (workers: 1 in CI) to prioritize determinism and stability over raw execution speed in a test-assignment context. Parallel execution (workers/sharding) can be enabled later as the suite and environment scale.
	• installs dependencies
	• runs ESLint
	• runs Playwright tests
	• uploads Playwright HTML report as an artifact for post-run analysis
	• ensures consistent execution on every pull request