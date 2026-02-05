# Git Branching Strategy

This document defines our branch naming conventions and workflow for managing code changes.

---

## Branch Naming Convention

### Format
```
[prefix]-[task_name]
```

### Rules
- Use **lowercase**
- Separate words with **underscores** (`_`)
- Keep task names **brief but descriptive**
- No spaces or special characters

### Prefixes

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat` | New features or functionality | `feat-user_login` |
| `fix` | Bug fixes | `fix-database_timeout` |
| `qa` | Quality assurance and testing | `qa-login_testing` |
| `docs` | Documentation updates | `docs-setup_guide` |

### Examples
```bash
feat-password_reset
fix-api_error_handling
qa-checkout_flow
docs-branching_strategy
```

---

## Branching Workflow

### 1. Always Start from Main
Before creating a new branch, make sure you're up to date:
```bash
git checkout main
git pull origin main
```

### 2. Create Your Feature Branch
```bash
git checkout -b feat-your_task_name
```

### 3. Work on Your Branch
- Make commits as you progress
- Push to remote regularly to back up your work:
```bash
git push origin feat-your_task_name
```

### 4. Keep Your Branch Updated
If `main` changes while you're working, sync your branch:
```bash
git checkout main
git pull origin main
git checkout feat-your_task_name
git merge main
```

Resolve any conflicts, commit, and push.

### 5. Submit Pull Request
When your work is ready:
- Push final changes
- Create PR on GitHub
- Follow the [workflow process](workflow.md)

### 6. After Merge
Delete your branch:
```bash
git checkout main
git pull origin main
git branch -d feat-your_task_name
```

---

## Branch Management

### Active Branches
- Each task should have its own branch
- Branch off of `main`, not other feature branches
- Delete branches after merging

### Main Branch
- **Protected**—do not commit directly to `main`
- Always in a working state
- Only updated via approved pull requests

### Stale Branches
- If a branch sits inactive for 2+ weeks, check in with the owner
- Delete merged branches promptly

---

## Handling Conflicts

### When Merging Main into Your Branch
If conflicts occur when syncing with `main`:

1. **Don't panic**—conflicts are normal
2. Open the conflicting files in your editor
3. Look for conflict markers:
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Changes from main
   >>>>>>> main
   ```
4. Decide which changes to keep (or combine them)
5. Remove conflict markers
6. Test to make sure everything still works
7. Commit the resolved conflicts:
   ```bash
   git add .
   git commit -m "fix: resolve merge conflicts with main"
   git push origin your-branch-name
   ```

### When in Doubt
- Ask for help from the team lead or another team member
- Don't force-push unless you know what you're doing

---

## Quick Reference

### Common Commands
```bash
# Create new branch
git checkout -b feat-task_name

# Switch branches
git checkout branch-name

# See all branches
git branch -a

# Delete local branch
git branch -d branch-name

# Update your branch with main
git checkout main
git pull origin main
git checkout your-branch
git merge main

# Push your branch
git push origin your-branch-name
```

### Workflow Checklist
- [ ] Start from updated `main`
- [ ] Create branch with proper naming
- [ ] Make commits with [conventional commit messages](workflow.md#commit-message-standards)
- [ ] Keep branch synced with `main`
- [ ] Submit PR when ready
- [ ] Delete branch after merge

---

## Why This Matters

Good branching practices:
- Keep code organized and traceable
- Prevent conflicts and confusion
- Make collaboration smoother
- Allow multiple people to work simultaneously

---

## Questions?
If you're unsure about branching or run into issues, reach out to the team lead or ask in our team channel.
