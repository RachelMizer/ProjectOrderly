# Contributing to Orderly

Welcome to the team. This document is your single reference for everything you need to go from a Trello card to a merged pull request — including how our CI pipeline fits into that process.

For deeper detail on any section, follow the links to the full standards docs.

---

## Quick Links

| Document | What It Covers |
|---|---|
| [Branching Strategy](docs/StandardsAndProcedures/InDepth/branching-strategy.md) | Branch naming, creation, and cleanup |
| [Workflow — CLI](docs/StandardsAndProcedures/InDepth/workflow.md) | Full Git workflow (command line) |
| [Workflow — GitHub Desktop](docs/StandardsAndProcedures/InDepth/workflow-github-desktop.md) | Full Git workflow (GitHub Desktop) |
| [Code Review Standards](docs/StandardsAndProcedures/InDepth/code_review_standards.md) | PR requirements and reviewer expectations |

---

## Branch Naming

Always branch off of `main`. Follow this format:

```
[prefix]-[task_name]
```

| Prefix | Use For |
|---|---|
| `feat` | New features |
| `fix` | Bug fixes |
| `qa` | QA and testing work |
| `docs` | Documentation only |

**Examples:**
```
feat-customer_ordering_flow
fix-cart_total_calculation
qa-checkout_testing
docs-api_contract_update
```

Rules: lowercase, underscores between words, no spaces or special characters.

---

## Trello → GitHub Flow

Every Trello card maps to one branch and one pull request. Keep your card updated — it's how the team stays coordinated without constant check-ins.

| Trello List | What It Means | Your Action |
|---|---|---|
| Sprint Backlog | Ready to pick up | — |
| In Progress | Work has started | Move card, add checklist |
| Review | Work complete, peer review | Move card, **open your PR**, paste PR link in the card, assign a reviewer |
| Testing | Peer review cleared, awaiting QA | Move card, notify Kenny |
| Done 🎉 | QA cleared, PR merged | Merge PR on GitHub, move card |

> **The PR link must be on the Trello card.** When you move to Review, open your PR on GitHub and paste the URL into the card description. This keeps GitHub and Trello in sync and makes sure nothing falls through the cracks.

> **Never skip Review before Testing.** Peer review catches issues before Kenny spends time on QA. Wait for reviewer sign-off before moving to Testing.

---

## Running Tests Locally

Run the full backend test suite before pushing. If it fails locally, it will fail in CI and block your PR.

### Backend (pytest)

```bash
# From the repo root
pip install -r requirements.txt
python manage.py migrate
pytest --tb=short -v
```

### Running a specific test file

```bash
pytest tests/test_auth_api.py -v
```

### Running a specific test

```bash
pytest tests/test_auth_api.py::test_login_success -v
```

> **pytest.ini is already configured** with `DJANGO_SETTINGS_MODULE = orderly.settings` — no extra setup needed.

### Frontend (React)

```bash
# From the frontend directory
npm install
npm run lint
npm test
```

---

## CI Pipeline

Every pull request to `main` automatically triggers two checks:

| Check | What It Does |
|---|---|
| **Backend Tests** | Installs dependencies, runs migrations, runs full pytest suite |
| **Frontend Checks** | Installs dependencies, runs linter, runs npm tests, runs Robot Framework acceptance tests |

### What a red ❌ means

Your PR cannot be merged until the failing check is resolved. Click **Details** next to the failed check on GitHub to see the full output and identify what broke.

**Common causes:**
- A test is failing that passed locally — check for environment differences
- A migration is missing — run `python manage.py makemigrations` and commit it
- A linting error in the frontend — run `npm run lint` locally to catch it before pushing

### What a green ✅ means

Both checks passed. Your PR is eligible to move forward to code review — but CI passing does not replace review. At least one teammate must still approve before merge.

---

## Pull Request Checklist

Before requesting review, confirm:

- [ ] Branch named correctly and created from `main`
- [ ] Trello card linked in the PR description
- [ ] PR title is clear and descriptive (see [Code Review Standards](docs/StandardsAndProcedures/code_review_standards.md))
- [ ] Description explains what changed and why
- [ ] How-to-test steps are included
- [ ] Screenshots attached if UI changed
- [ ] Tests pass locally (`pytest --tb=short -v`)
- [ ] At least 1 reviewer assigned
- [ ] Trello card moved to **Review**
- [ ] PR link pasted into the Trello card description

---

## Who Reviews What

| Area | Primary Reviewer |
|---|---|
| Backend / Django / API | Tristin G. |
| Frontend / React / UI | Rachel M. |
| Testing / QA | Kenny B. |
| Documentation | Caleb F. |
| All PRs (final check) | Serina R. |

Any team member can review any PR. The table above reflects primary ownership — when in doubt, assign the person closest to that area of the codebase.

---

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type: brief description
```

Keep it under 50 characters, present tense.

```
feat: add customer order submission endpoint
fix: resolve cart total rounding error
test: add serializer tests for registration
docs: update contributing guide with CI section
```

---

## Questions?

Reach out to Serina in the team channel or tag her on your Trello card.

------

*Last updated: April 2, 2026 — Serina Rodriguez, PM/Scrum Master*
