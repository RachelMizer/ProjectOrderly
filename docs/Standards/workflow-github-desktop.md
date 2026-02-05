# Development Workflow (GitHub Desktop)

> **Prefer command line?** See the [CLI workflow guide](workflow.md)

This document outlines our standard process for moving work from task assignment to completion using GitHub Desktop.

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

1. Open **GitHub Desktop**
2. Make sure you're on the **main** branch (check top left dropdown)
3. Click **Fetch origin** (top right)
4. If there are updates, click **Pull origin**

**What this does:**
- **Fetch** downloads latest changes from GitHub
- **Pull** updates your local main branch

### 3. Create or Switch to Your Branch
Follow the [branching strategy](branching-strategy.md):

1. Click **Current Branch** dropdown at the top
2. Click **New Branch**
3. Name it using our convention: `feat-your_task_name`
4. Make sure "Create branch based on: **main**" is selected
5. Click **Create Branch**

**Example:**
- Branch name: `feat-user_login`

**If the branch already exists:**
- Just select it from the **Current Branch** dropdown

### 4. Make Your Changes
- Write code, update docs, add tests—whatever the task requires
- Test locally to ensure it works
- GitHub Desktop will show your changes in the left panel

### 5. Commit Your Changes
Follow our [commit message standards](#commit-message-standards):

1. Review changed files in the left panel
2. Check the boxes next to files you want to commit (or check all)
3. In the **Summary** field (bottom left), write your commit message:
   - Example: `feat: add user login validation`
4. Click **Commit to feat-your_task_name**
5. Click **Push origin** (top right) to send changes to GitHub

**What the commit message should look like:**
- Format: `type: brief description`
- Under 50 characters
- Present tense

### 6. Submit Pull Request

1. After pushing, GitHub Desktop will show **"Create Pull Request"** button
2. Click it (opens GitHub in your browser)
3. Fill out the pull request:
   - **Title:** Brief description of what changed
   - **Description:** Explain what you did and why
     - Link to the Trello card if applicable
     - Note anything reviewers should pay attention to
     - Include screenshots/examples if relevant
4. **Assign 2 reviewers minimum** (use the right sidebar)
5. Click **"Create pull request"**
6. Move your Trello card to **"Review"**

### 7. Code Review Process

**For the author:**
- Respond to feedback and questions on GitHub
- Make requested changes in your code editor
- GitHub Desktop will detect the changes
- Commit and push updates—PR will automatically update:
  1. Make the changes
  2. Commit with message: `fix: address review feedback`
  3. Push origin
- Re-request review after making changes

**For reviewers:**
- Check that code works as intended
- Look for bugs, edge cases, or potential issues
- Verify it follows our standards and conventions
- Provide constructive, specific feedback
- Approve when satisfied

### 8. Merge and Complete
Once approved by 2 reviewers:

1. Go to the PR on GitHub (in your browser)
2. Click **"Merge pull request"**
3. Click **"Confirm merge"**
4. Click **"Delete branch"** (keeps repo clean)
5. Back in GitHub Desktop:
   - Switch to **main** branch
   - Click **Fetch origin**
   - Click **Pull origin** to get the merged changes
6. Move Trello card to **"Done"**

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
```
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

### GitHub Desktop Interface

**Top Bar:**
- **Current Repository** - Shows which repo you're working in
- **Current Branch** - Shows which branch you're on (click to switch/create)
- **Fetch origin** - Check for updates from GitHub
- **Push origin** - Send your commits to GitHub

**Left Panel:**
- **Changes** - Files you've modified
- **History** - Past commits

**Bottom Left:**
- **Summary** - Your commit message goes here
- **Description** - Optional longer explanation

### Workflow At-a-Glance

| Action | Trello Status | GitHub Desktop Steps |
|--------|---------------|---------------------|
| Start task | In Progress | Switch to main → Pull → Create new branch |
| Save progress | In Progress | Check files → Write commit message → Commit → Push |
| Ready for review | Review | Click "Create Pull Request" → Fill out form |
| Approved | Done | Merge on GitHub → Switch to main → Pull |

---

## Troubleshooting

### "Your branch is behind origin/main"
1. Switch to **main** branch
2. Click **Fetch origin**
3. Click **Pull origin**
4. Switch back to your branch
5. Go to **Branch** menu → **Update from main**

### "You have uncommitted changes"
You need to commit or discard them first:

**Option 1: Commit them**
1. Review the changes
2. Write a commit message
3. Click **Commit to [branch-name]**

**Option 2: Discard them**
1. Right-click the file
2. Select **Discard changes**
3. Confirm (this is permanent!)

### "Merge conflict"
GitHub Desktop will show conflicts in red:
1. Click the conflicted file to open it
2. Look for conflict markers in your editor:
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Changes from main
   >>>>>>> main
   ```
3. Edit the file to keep the correct code
4. Remove the conflict markers
5. Save the file
6. Return to GitHub Desktop
7. Click **Commit merge**

**Need help?** See [branching strategy - handling conflicts](branching-strategy.md#handling-conflicts) or ask the team lead.

---

## Questions?
If anything is unclear or you run into issues, reach out to the team lead or ask in our team channel.
