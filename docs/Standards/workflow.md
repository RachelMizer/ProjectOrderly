# Development Workflow (Command Line)

> **Using GitHub Desktop?** See the [GitHub Desktop Workflow Guide](workflow-github-desktop.md)

This document outlines our standard process for moving work from task assignment to completion using the Git command line.

---

## Process Overview

1. **Claim your task** → Move the Trello card to **"In Progress"**
2. **Sync with main** → Fetch and pull the latest changes
3. **Create/switch to your branch** → Follow the branching strategy
4. **Complete the work** → Make your changes
5. **Commit your changes** → Use standard commit messages
6. **Submit for review** → Create a pull request and move the card to **"Review"**
7. **Address feedback** → Make requested changes if needed
8. **Merge and close** → Once approved, move the card to **"Done"**

---

## Step-by-Step Workflow

### 1. Start Your Task
- Move your Trello card from the backlog to **"In Progress"**
- This signals to the team that you are actively working on it

---

### 2. Sync with the Main Branch

Before creating a branch or making changes:

```bash
git fetch origin
git checkout main
git pull origin main
```

**What this does:**
- `fetch` — Downloads the latest changes from GitHub
- `checkout main` — Switches to your local main branch
- `pull` — Updates your local main branch

---

### 3. Create or Switch to Your Branch

Follow the [branching strategy](branching-strategy.md):

```bash
git checkout -b feat-your_task_name
```

**Example:**

```bash
git checkout -b feat-user_login
```

---

### 4. Make Your Changes
- Write code, update documentation, add tests — whatever the task requires
- Test locally to ensure everything works correctly
- Keep commits focused and logically structured

---

### 5. Commit Your Changes

Follow our [commit message standards](#commit-message-standards):

```bash
# Stage your changes
git add .

# Commit with a message
git commit -m "feat: add user login validation"

# Push to GitHub
git push origin feat-your_task_name
```

**First time pushing this branch?** Git may instruct you to use:

```bash
git push --set-upstream origin feat-your_task_name
```

---

### 6. Submit a Pull Request
- Navigate to your repository on GitHub
- You will see a prompt to **"Compare & pull request"** (click it)

**Pull Request Details:**
- **Title:** Brief description of what changed
- **Description:** Explain what you did and why
  - Link the Trello card if applicable
  - Note anything reviewers should pay attention to
  - Include screenshots/examples if relevant

- Assign **a minimum of 2 reviewers**
- Click **"Create pull request"**
- Move the Trello card to **"Review"**

---

### 7. Code Review Process

**For the Author:**
- Respond to feedback and questions
- Make requested changes in new commits on the same branch
- Push updates (the PR will update automatically):

```bash
git add .
git commit -m "fix: address review feedback"
git push origin feat-your_task_name
```

- Re-request review after making changes

---

**For Reviewers:**
- Verify that the code works as intended
- Look for bugs, edge cases, or potential issues
- Ensure it follows team standards and conventions
- Provide constructive, specific feedback
- Approve when satisfied

---

### 8. Merge and Complete

Once approved by **two reviewers**:

- Open the PR on GitHub
- Click **"Merge pull request"**
- Click **"Confirm merge"**
- Click **"Delete branch"** (keeps the repository clean)
- Move the Trello card to **"Done"**

---

## Commit Message Standards

We use **Conventional Commits** (industry-standard format).

---

### Format

```
type: brief description
```

---

### Rules
- Keep messages under **50 characters**
- Use present tense ("add" not "added")
- Be specific yet concise

---

### Types
- `feat` — New feature or functionality
- `fix` — Bug fix
- `docs` — Documentation changes
- `test` — Adding or updating tests
- `refactor` — Code restructuring without changing behavior
- `style` — Formatting changes only
- `chore` — Maintenance or dependency updates

---

### Examples

```bash
feat: add password reset functionality
fix: resolve database connection timeout
docs: update setup instructions in README
test: add unit tests for login validation
refactor: simplify user authentication logic
style: fix indentation in header component
```

---

## Pull Request Standards

---

### Minimum Requirements
- **Two reviewers** must approve before merging
- All conversations must be resolved
- Code must pass automated checks (if applicable)

---

### What Reviewers Should Check
- Does the code work as described?
- Are any bugs or edge cases overlooked?
- Does it follow team conventions and standards?
- Is it readable and maintainable?
- Are tests included (if applicable)?

---

### Handling Feedback
- Be open to suggestions — reviews improve code quality
- Ask questions if feedback is unclear
- Make requested changes or explain disagreements respectfully
- Thank reviewers for their time

---

## Quick Reference

---

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
```

---

### Workflow At-a-Glance

| Action | Trello Status | Git Command |
|--------|---------------|-------------|
| Start task | In Progress | `git checkout -b feat-task_name` |
| Save progress | In Progress | `git commit -m "type: description"` |
| Push to GitHub | In Progress | `git push origin branch-name` |
| Ready for review | Review | Create PR on GitHub |
| Approved | Done | Merge PR, delete branch |

---

## Troubleshooting

---

### "Your branch is behind 'origin/main'"

```bash
git pull origin main
```

---

### "You have uncommitted changes"

Commit or stash them first:

```bash
# Option 1: Commit changes
git add .
git commit -m "fix: save current progress"

# Option 2: Stash temporarily
git stash
# (perform required actions)
git stash pop
```

---

### "Merge conflict"

See:  
[Branching Strategy — Handling Conflicts](branching-strategy.md#handling-conflicts)

---

## Questions?

If anything is unclear or you encounter issues, reach out to the team lead or ask in the team communication channel.

