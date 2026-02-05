# Development Workflow (Command Line)

> **Using GitHub Desktop?** See the [GitHub Desktop workflow guide](workflow-github-desktop.md)

This document outlines our standard process for moving work from task assignment to completion using Git command line.

---

## Process Overview

1. **Claim your task** → Move Trello card to "In Progress"
2. **Sync with main** → Fetch and pull latest changes
3. **Create/switch to your branch** → Follow branching strategy
4. **Do the work** → Make your changes
5. **Commit your changes** → Use standard commit messages
6. **Submit for review** → Create pull request, move card to "Review"
7. **Address feedback** → Make requested changes if needed
8. **Merge and close** → Once approved, move card to "Done"

---

## Step-by-Step Workflow

### 1. Start Your Task
- Move your Trello card from backlog to **"In Progress"**
- This signals to the team that you're actively working on it

### 2. Sync with Main Branch
Before creating a branch or making changes:
```bash
git fetch origin
git checkout main
git pull origin main
```

**What this does:**
- `fetch` - Downloads latest changes from GitHub
- `checkout main` - Switches to your main branch
- `pull` - Updates your local main branch

### 3. Create or Switch to Your Branch
Follow the [branching strategy](branching-strategy.md):
```bash
git checkout -b feat-your_task_name
```

**Example:**
```bash
git checkout -b feat-user_login
```

### 4. Make Your Changes
- Write code, update docs, add tests—whatever the task requires
- Test locally to ensure it works
- Keep commits focused and logical

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

**First time pushing this branch?** Git will tell you to use:
```bash
git push --set-upstream origin feat-your_task_name
```

### 6. Submit Pull Request
- Go to your repository on GitHub
- You'll see a prompt to "Compare & pull request" (click it)
- **Title:** Brief description of what changed
- **Description:** Explain what you did and why
  - Link to the Trello card if applicable
  - Note anything reviewers should pay attention to
  - Include screenshots/examples if relevant
- **Assign 2 reviewers minimum**
- Click "Create pull request"
- Move your Trello card to **"Review"**

### 7. Code Review Process

**For the author:**
- Respond to feedback and questions
- Make requested changes in new commits on the same branch
- Push updates—PR will automatically update:
  ```bash
  git add .
  git commit -m "fix: address review feedback"
  git push origin feat-your_task_name
  ```
- Re-request review after making changes

**For reviewers:**
- Check that code works as intended
- Look for bugs, edge cases, or potential issues
- Verify it follows our standards and conventions
- Provide constructive, specific feedback
- Approve when satisfied

### 8. Merge and Complete
Once approved by 2 reviewers:
- Go to the PR on GitHub
- Click "Merge pull request"
- Click "Confirm merge"
- Click "Delete branch" (keeps repo clean)
- Move Trello card to **"Done"**

---

## Commit Message Standards

We use **Conventional Commits** (industry standard format).

### Format
```
type: brief description
```

### Rules
- **Keep it under 50 characters**
- **Use present tense** ("add" not "added")
- Be specific but concise

### Types
- `feat` - New feature or functionality
- `fix` - Bug fix
- `docs` - Documentation changes
- `test` - Adding or updating tests
- `refactor` - Code restructuring without changing behavior
- `style` - Formatting, missing semicolons, etc.
- `chore` - Maintenance tasks, dependency updates

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

### Minimum Requirements
- **2 reviewers** must approve before merging
- All conversations must be resolved
- Code must pass any automated checks (if applicable)

### What Reviewers Should Check
- Does the code work as described?
- Are there any bugs or edge cases missed?
- Does it follow our conventions and standards?
- Is it readable and maintainable?
- Are there tests (if applicable)?

### Handling Feedback
- Be open to suggestions—reviews improve code quality
- Ask questions if feedback is unclear
- Make requested changes or explain why you disagree
- Thank reviewers for their time

---

## Quick Reference

### Common Commands
```bash
# Check which branch you're on
git branch

# Switch to main and update
git checkout main
git pull origin main

# Create and switch to new branch
git checkout -b feat-task_name

# See what's changed
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

### "Your branch is behind 'origin/main'"
```bash
git pull origin main
```

### "You have uncommitted changes"
Commit or stash them first:
```bash
# Option 1: Commit them
git add .
git commit -m "fix: save current progress"

# Option 2: Stash them temporarily
git stash
# (do what you need to do)
git stash pop  # brings changes back
```

### "Merge conflict"
See [branching strategy - handling conflicts](branching-strategy.md#handling-conflicts)

---

## Questions?
If anything is unclear or you run into issues, reach out to the team lead or ask in our team channel.
