# Development Workflow (Command Line)

> **Using GitHub Desktop?** See the [GitHub Desktop Workflow Guide](https://github.com/xaniresx/ProjectOrderly/blob/main/docs/Standards/workflow-github-desktop.md)

This document outlines the full process for moving work from task assignment to completion — covering both your Git activity and your responsibilities on the Trello board at each stage.

------

## How Trello and GitHub Work Together

Every card on Trello maps directly to a branch and pull request on GitHub. Keeping your Trello card up to date is just as important as keeping your code up to date — it's how the team stays coordinated without needing to ask for status updates.

**The Trello board has five main lists for all team members:**

| List           | Who Moves Cards Here | What It Means                         |
| -------------- | -------------------- | ------------------------------------- |
| Sprint Backlog | Scrum Master         | Task is ready to be picked up         |
| In Progress    | Card Owner           | Work has started                      |
| Testing        | Card Owner           | Work is complete, awaiting QA triage  |
| Review         | Card Owner           | Testing cleared, awaiting code review |
| Done           | Card Owner           | Approved and merged                   |

------

## Process Overview

1. **Claim your task** → Move card to **In Progress**, set up your checklist
2. **Sync with main** → Fetch and pull latest changes
3. **Create your branch** → Follow the branching strategy
4. **Do the work** → Complete your checklist, commit regularly
5. **Move to Testing** → Kenny triages and processes QA
6. **Move to Review** → Open your pull request once testing clears
7. **Address feedback** → Make requested changes if needed
8. **Merge and close** → Once approved, merge and move card to **Done**

------

## Step-by-Step Workflow

### 1. Claim Your Task

When you pick up a card from the **Sprint Backlog**:

- Move the card to **In Progress**
- Open the card and add a checklist of the major tasks you plan to complete to satisfy the acceptance criteria already listed on the card
- This checklist is yours to define — break the work down in a way that makes sense to you
- Keep it updated as you progress

> The acceptance criteria on the card defines *what done looks like*. Your checklist defines *how you plan to get there*.

------

### 2. Sync with the Main Branch

Before creating a branch or writing any code:

```bash
git fetch origin
git checkout main
git pull origin main
```

**What this does:**

- `fetch` — Downloads the latest changes from GitHub
- `checkout main` — Switches to your local main branch
- `pull` — Updates your local main branch with any merged work

------

### 3. Create Your Branch

Follow the [branching strategy](https://github.com/xaniresx/ProjectOrderly/blob/main/docs/Standards/branching-strategy.md):

```bash
git checkout -b feat-your_task_name
```

**Example:**

```bash
git checkout -b feat-user_login
```

Branch names should be lowercase, use hyphens or underscores, and clearly describe the work.

------

### 4. Do the Work

- Write code, update documentation, add tests — whatever the task requires
- Test locally to ensure everything works as expected
- Keep commits focused and logically structured
- Check off items in your Trello checklist as you complete them
- **Do not move the card until your checklist is fully complete and all acceptance criteria on the card are marked done**

Commit regularly as you work:

```bash
git add .
git commit -m "feat: add user login form validation"
git push origin feat-your_task_name
```

Keep commits focused and logically structured.

**First time pushing this branch?** Git may prompt you to use:

```bash
git push --set-upstream origin feat-your_task_name
```

------

### 5. Move to Testing

Once your checklist is fully complete and all acceptance criteria are marked done on the Trello card:

- Move the card to the **Testing** list
- Do not open a pull request yet

Kenny (Testing/QA Lead) will triage the card and apply one of the following labels:

| Label                  | Meaning                                         |
| ---------------------- | ----------------------------------------------- |
| 🔴 Testing Required     | Needs test cases executed before moving forward |
| 🟡 Testing In Progress  | Actively being tested by QA                     |
| 🟢 Testing Complete     | Passed testing, eligible to move to Review      |
| ⚪ Testing Not Required | No testing needed, eligible to move to Review   |

> **A card should only leave the Testing list when Kenny has applied a final label (🟢 or ⚪).** Do not move the card forward on your own — wait for Kenny's label.

**If issues are found during testing**, Kenny will flag them on the card. Address the feedback on your branch, commit and push the fixes, and notify Kenny when ready for re-testing:

```bash
git add .
git commit -m "fix: correct login validation edge case"
git push origin feat-your_task_name
```

------

### 6. Open Your Pull Request and Move to Review

Once Kenny has applied 🟢 Testing Complete or ⚪ Testing Not Required:

**Open the pull request on GitHub:**

- Navigate to the repository on GitHub
- You will see a prompt to **"Compare & pull request"** — click it
- Fill out the pull request:
  - **Title:** Brief description of what changed
  - **Description:** Explain what you did and why
    - Link the Trello card
    - Note anything reviewers should pay attention to
    - Include screenshots or examples if relevant
- Assign **a minimum of 1 reviewers**
- Click **"Create pull request"**

**Then move your Trello card to the Review list.**

This signals to the Scrum Master that the card is ready for review assignment. The card will receive one of the following labels:

| Label                       | Meaning                                    |
| --------------------------- | ------------------------------------------ |
| 👀 Needs Review              | Flagged, awaiting reviewer assignment      |
| 🔍 In Review                 | Actively being reviewed                    |
| 👥 Needs Additional Review   | More reviewers required                    |
| ⏸️ On Hold                   | Review paused — check the card for context |
| ✅ Approved (Ready to Merge) | Cleared for merge                          |

------

### 7. Address Review Feedback

While your card is in Review, monitor your pull request for comments and feedback.

**As the author:**

- Respond to questions and comments on GitHub
- Make requested changes on your branch and push updates — the PR will update automatically:

```bash
git add .
git commit -m "fix: address review feedback"
git push origin feat-your_task_name
```

- Re-request review from your reviewers after making changes
- If you disagree with feedback, explain your reasoning constructively — don't just silently make or ignore changes

**If the card is placed On Hold**, check the Trello card for context and reach out to the Scrum Master if it's unclear.

------

### 8. Merge and Complete

Once the card is labeled **✅ Approved (Ready to Merge)**:

**On GitHub:**

```bash
# You can also do this via the GitHub web interface
```

- Open the PR on GitHub
- Click **"Merge pull request"**
- Click **"Confirm merge"**
- Click **"Delete branch"** to keep the repository clean

**Back in your terminal, clean up locally:**

```bash
git checkout main
git pull origin main
git branch -d feat-your_task_name
```

**On Trello:**

- Move the card to **Done**

------

## Commit Message Standards

We use **Conventional Commits** (industry-standard format).

### Format

```
type: brief description
```

### Rules

- Keep messages under **50 characters**
- Use present tense ("add" not "added")
- Be specific yet concise

### Types

| Type       | Use For                                    |
| ---------- | ------------------------------------------ |
| `feat`     | New feature or functionality               |
| `fix`      | Bug fix                                    |
| `docs`     | Documentation changes                      |
| `test`     | Adding or updating tests                   |
| `refactor` | Code restructuring without behavior change |
| `style`    | Formatting changes only                    |
| `chore`    | Maintenance or dependency updates          |

### Examples

```bash
feat: add password reset functionality
fix: resolve database connection timeout
docs: update setup instructions in README
test: add unit tests for login validation
refactor: simplify user authentication logic
style: fix indentation in header component
```

------

## Pull Request Standards

### Minimum Requirements

- **One reviewer** must approve before merging-- *someone other than yourself.*
- All review conversations must be resolved
- Code must pass any automated checks (if applicable)

### What Reviewers Should Check

- Does the code work as described?
- Are there any bugs or edge cases overlooked?
- Does it follow team conventions and standards?
- Is it readable and maintainable?
- Are tests included where applicable?

### Handling Feedback

- Be open to suggestions — reviews improve code quality
- Ask questions if feedback is unclear
- Make requested changes or explain your reasoning respectfully

------

## Quick Reference

### Common Commands

```bash
# Check your current branch
git branch

# Switch to main and update
git checkout main
git pull origin main

# Create and switch to a new branch
git checkout -b feat-task_name

# View modified files
git status

# Stage and commit changes
git add .
git commit -m "type: description"

# Push to GitHub
git push origin branch-name

# Update your branch with latest main
git checkout main
git pull origin main
git checkout your-branch
git merge main

# Delete local branch after merge
git branch -d feat-task_name
```

### Full Workflow At-a-Glance

| Stage           | Trello Action                          | GitHub / Git Action                 |
| --------------- | -------------------------------------- | ----------------------------------- |
| Pick up task    | Move to **In Progress**, add checklist | `git checkout -b feat-task_name`    |
| Working         | Update checklist as you go             | Commit and push regularly           |
| Work complete   | Move to **Testing**                    | Push final commits                  |
| Testing flagged | Wait for Kenny's label (🟢 or ⚪)        | Address any QA fixes on branch      |
| Testing cleared | Move to **Review**                     | Open pull request, assign reviewers |
| Review feedback | Monitor card labels                    | Commit fixes, re-request review     |
| Approved        | Move to **Done**                       | Merge PR, delete branch             |

------

## Troubleshooting

### "Your branch is behind 'origin/main'"

```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main
```

### "You have uncommitted changes"

```bash
# Option 1: Commit them
git add .
git commit -m "fix: save current progress"

# Option 2: Stash temporarily
git stash
# (perform required actions)
git stash pop
```

------

## Questions?

If anything is unclear or you run into an issue, reach out to the Scrum Master or ask in the team channel.
