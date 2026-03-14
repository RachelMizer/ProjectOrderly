# Cleaning your local git stash

If you have 30k stashed files on github desktop, these commands will help you clean that up.
**Warning**: These steps are destructive for uncommitted local changes and untracked files. Follow the backup step!

---
## 1) Backup your work
Move any documents you altered to safe location **outside** of the repo

## 2) Match main branch
Use these commands to match your local repo to the main branch
```
git fetch
git reset --hard origin/main
```

## 3) Remove untracked files
Forces removal of untracked files and directories (the first command previews what will be deleted)
```
git clean -fdxn
git clean -fdx
```

## 4) Restore your stashed work
Move your work back into the repo.