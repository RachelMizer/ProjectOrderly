# Code Review Standards

**Purpose:** Establish consistent code review expectations so we maintain high code quality, reduce defects, and share knowledge across the team.

---

## 1. Goals of Code Review
Code reviews should help us:
- Catch defects early (logic, security, edge cases)
- Improve readability and maintainability
- Ensure consistent style and patterns
- Share knowledge across the team
- Protect the `main` branch from unstable changes

---

## 2. Review Workflow (Required)
1. **Create a branch** for work (feature/bugfix)
2. Open a **Pull Request (PR)** to merge into `main`
3. PR must include a clear description and any screenshots/notes needed
4. At least **1 approval** is recommended before merge  
5. PR must pass required checks (build/tests/lint) if configured
6. **Squash merge** is preferred to keep history clean (unless the team decides otherwise)

---

## 3. PR Requirements (What authors must include)

### PR Title
Use a clear, descriptive title:
- Good: `Add inventory update endpoint`
- Good: `Fix login redirect bug`
- Avoid: `updates`, `stuff`, `final`

### PR Description (Required Template)
Include:
- **What** changed (summary)
- **Why** it changed (context)
- **How to test** (steps)
- **Screenshots** (if UI changes)
- **Related Trello card / Issue link** (if applicable)

Suggested format:
- **Summary:**  
- **Changes:**  
- **How to Test:**  
- **Screenshots (if needed):**  
- **Related Card/Issue:**  

### Size Guidance
Keep PRs small when possible:
- Ideal: < 300 lines changed
- If larger, break into smaller PRs or explain why it’s large

---

## 4. Review Standards (What reviewers look for)

### A) Correctness
- Does it do what the user story/acceptance criteria require?
- Are edge cases handled (empty inputs, invalid states)?
- Any obvious bugs or missing logic?

### B) Readability & Maintainability
- Is the code easy to understand?
- Clear naming (variables, functions, classes)
- Functions are small and focused
- Avoid duplicated logic (use helpers/services)

### C) Security & Data Handling
- No secrets in code (API keys, passwords)
- Authentication/authorization checks are enforced server-side
- Input validation is present where needed
- Errors don’t leak sensitive info

### D) Testing Expectations
- New feature/bugfix includes **appropriate tests** when reasonable
- If tests aren’t included, author explains why and adds manual test steps
- No breaking existing tests without explanation

### E) Style & Consistency
- Follows project conventions (formatting, folder structure)
- Avoids unnecessary complexity
- Comments used only when needed (explain “why”, not “what”)

---

## 5. Approval Rules (When a PR should NOT be approved)
Do not approve if:
- It breaks the build or tests
- It includes hardcoded secrets or sensitive data
- It lacks clear testing instructions
- It introduces major scope beyond the stated purpose
- It changes behavior without updating docs or notes

---

## 6. How to Leave Feedback (Team Culture)
We want reviews to be helpful and respectful:
- Be specific and constructive
- Prefer “suggestions” over “commands” when possible
- Ask questions if something is unclear
- If you spot a pattern issue, propose a consistent approach

Helpful phrases:
- “Could we simplify this by…”
- “What happens if the input is empty?”
- “Is there a reason we chose this approach over…”
- “Can we add a quick test for this path?”

---

## 7. Response & Merge Expectations
- Authors should respond to review comments within **24 hours** when possible
- Reviewers should try to review within **24 hours** when possible
- Resolve conversations before merge
- If there is disagreement, escalate quickly in chat/meeting rather than long comment threads

---

## 8. Definition of Done for PRs
A PR is ready to merge when:
- It meets acceptance criteria for the card/story
- It has at least 1 approval (2 for larger changes when possible)
- It has testing steps and/or tests included
- It passes checks (if configured)
- It does not introduce known critical defects

---

## 9. Quick Review Checklist (Copy/Paste)
**For Authors (before requesting review):**
- [ ] PR title and description are clear
- [ ] Linked to Trello card/issue
- [ ] Added how-to-test steps
- [ ] Added screenshots if UI changed
- [ ] Ran the app/tests locally

**For Reviewers:**
- [ ] Meets acceptance criteria
- [ ] Handles edge cases
- [ ] No security issues or secrets
- [ ] Readable and consistent with project style
- [ ] Testing is included or documented

---

## 10. Exceptions
If an urgent hotfix is needed:
- Minimize scope
- Require at least 1 reviewer if available
- Add follow-up task to improve tests/docs if skipped

---

## 11. Agreement
These standards apply to all PRs unless the team agrees on an exception.
