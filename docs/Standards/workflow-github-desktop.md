# Development Workflow (GitHub Desktop)

> **Prefer the command line?** See the [CLI Workflow Guide](https://github.com/xaniresx/ProjectOrderly/blob/main/docs/Standards/workflow.md)

This document outlines the full process for moving work from task assignment to completion — covering both your GitHub Desktop activity and your responsibilities on the Trello board at each stage.

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

Before creating a branch or making any changes:

1. Open **GitHub Desktop**
2. Make sure you're on the **main** branch (check the top-left dropdown)
3. Click **Fetch origin** (top right)
4. If updates are available, click **Pull origin**

**What this does:**

- **Fetch** — Downloads the latest changes from GitHub
- **Pull** — Updates your local main branch with any merged work

------

### 3. Create Your Branch

Follow the [branching strategy](https://github.com/xaniresx/ProjectOrderly/blob/main/docs/Standards/branching-strategy.md):

1. Click the **Current Branch** dropdown at the top
2. Click **New Branch**
3. Name it using the convention: `feat-your_task_name`
4. Confirm **"Create branch based on: main"** is selected
5. Click **Create Branch**

**Example branch name:** `feat-user_login`

Branch names should be lowercase, use hyphens or underscores, and clearly describe the work.

**If the branch already exists:** Select it from the **Current Branch** dropdown instead.

------

### 4. Do the Work

- Write code, update documentation, add tests — whatever the task requires
- Test locally to ensure everything works as expected
- GitHub Desktop will show your changed files in the left panel
- Check off items in your Trello checklist as you complete them
- **Do not move the card until your checklist is fully complete and all acceptance criteria on the card are marked done**

Commit regularly as you work:

1. Review changed files in the left panel
2. Check the boxes next to files you want to include
3. Write your commit message in the **Summary** field (bottom left): e.g. `feat: add user login form validation`
4. Click **Commit to feat-your_task_name**
5. Click **Push origin** to send your commits to GitHub

Keep commits focused and logically structured.

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

**If issues are found during testing**, Kenny will flag them on the card. Address the feedback on your branch in your code editor, then in GitHub Desktop:

1. Review the changed files
2. Write a commit message: `fix: correct login validation edge case`
3. Click **Commit to feat-your_task_name**
4. Click **Push origin**
5. Notify Kenny when ready for re-testing

------

### 6. Open Your Pull Request and Move to Review

Once Kenny has applied 🟢 Testing Complete or ⚪ Testing Not Required:

**Open the pull request:**

1. After your last push, GitHub Desktop will show a **"Create Pull Request"** button — click it (this opens GitHub in your browser)
2. Fill out the pull request:
   - **Title:** Brief description of what changed
   - **Description:** Explain what you did and why
     - Link the Trello card
     - Note anything reviewers should pay attention to
     - Include screenshots or examples if relevant
3. Assign **a minimum of 1 reviewers** using the right sidebar
4. Click **"Create pull request"**

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

While your card is in Review, monitor your pull request on GitHub for comments and feedback.

**As the author:**

- Respond to questions and comments on GitHub
- Make requested changes in your code editor — GitHub Desktop will detect them automatically
- Commit and push the updates — the PR will update automatically:
  1. Make changes in your editor
  2. In GitHub Desktop: write a commit message like `fix: address review feedback`
  3. Click **Commit to feat-your_task_name**
  4. Click **Push origin**
- Re-request review from your reviewers after making changes
- If you disagree with feedback, explain your reasoning constructively — don't just silently make or ignore changes

**If the card is placed On Hold**, check the Trello card for context and reach out to the Scrum Master if it's unclear.

**For reviewers:**

- Verify that the code works as intended
- Look for bugs, edge cases, or potential issues
- Ensure it follows team standards and conventions
- Provide constructive, specific feedback
- Approve when satisfied

------

### 8. Merge and Complete

Once the card is labeled **✅ Approved (Ready to Merge)**:

**On GitHub (in your browser):**

1. Open the pull request
2. Click **"Merge pull request"**
3. Click **"Confirm merge"**
4. Click **"Delete branch"** to keep the repository clean

**Back in GitHub Desktop, clean up locally:**

1. Switch to the **main** branch using the Current Branch dropdown
2. Click **Fetch origin**
3. Click **Pull origin** to get the merged changes

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

```
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

- **One reviewer** must approve before merging- *someone other than yourself.*
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

### GitHub Desktop Interface

**Top Bar:**

- **Current Repository** — Shows which repo you're working in
- **Current Branch** — Shows your active branch (click to switch or create)
- **Fetch origin** — Check for updates from GitHub
- **Push origin** — Send your local commits to GitHub

**Left Panel:**

- **Changes** — Files you've modified since your last commit
- **History** — Past commits on the current branch

**Bottom Left:**

- **Summary** — Your commit message goes here
- **Description** — Optional longer explanation

### Full Workflow At-a-Glance

| Stage           | Trello Action                          | GitHub Desktop Action                      |
| --------------- | -------------------------------------- | ------------------------------------------ |
| Pick up task    | Move to **In Progress**, add checklist | Switch to main → Pull → Create new branch  |
| Working         | Update checklist as you go             | Commit and push regularly                  |
| Work complete   | Move to **Testing**                    | Push final commits                         |
| Testing flagged | Wait for Kenny's label (🟢 or ⚪)        | Address any QA fixes, push updates         |
| Testing cleared | Move to **Review**                     | Create pull request, assign reviewers      |
| Review feedback | Monitor card labels                    | Commit fixes, re-request review            |
| Approved        | Move to **Done**                       | Merge PR on GitHub → Switch to main → Pull |

------

## Troubleshooting

### "Your branch is behind origin/main"

1. Switch to the **main** branch via the Current Branch dropdown
2. Click **Fetch origin**
3. Click **Pull origin**
4. Switch back to your branch
5. Go to **Branch** menu → **Update from main**

### "You have uncommitted changes"

You need to commit or discard them first:

**Option 1: Commit them**

1. Review the changes in the left panel
2. Write a commit message in the Summary field
3. Click **Commit to [branch-name]**

**Option 2: Discard them**

1. Right-click the file in the left panel
2. Select **Discard changes**
3. Confirm — this is permanent

### "Merge conflict"

GitHub Desktop will flag conflicts:

1. Click the conflicted file to open it in your editor

2. Look for conflict markers:

   ```
   <<<<<<< HEADYour changes=======Changes from main>>>>>>> main
   ```

3. Edit the file to keep the correct version

4. Remove all conflict markers

5. Save the file

6. Return to GitHub Desktop and click **Commit merge**

------

## Questions?

If anything is unclear or you run into an issue, reach out to the Scrum Master or ask in the team channel.
