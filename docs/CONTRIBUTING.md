# Contributing to ADU Dashboard

## Git Workflow

This project uses a protected `master` branch. All changes must go through pull requests.

### Branch Structure

- **`master`** - Production branch (protected, requires PRs)
- **`develop`** - Development branch (base for feature branches)
- **`feature/*`** - Feature branches (created from `develop`)

### Making Changes

#### 1. Create a Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

#### 2. Make Your Changes
```bash
# Edit files, commit as needed
git add .
git commit -m "feat: Description of changes"
```

#### 3. Push to Remote
```bash
git push origin feature/your-feature-name
```

#### 4. Create a Pull Request
- Go to https://github.com/odanree/adu-dashboard
- Click "New Pull Request"
- Set base: `master` ← compare: `feature/your-feature-name`
- Add description and submit

#### 5. Review & Merge
- Review changes in the PR
- Once approved, merge to `master`
- Delete the feature branch

## Branch Protection Rules (for `master`)

The following rules are enforced:

- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging (CI/CD)
- ✅ Require branches to be up to date before merging
- ✅ Include administrators in restrictions (no direct pushes, even for admins)
- ✅ Require conversation resolution before merging
- ✅ Require commit signature verification

### To Configure These Rules:

1. Go to: **Settings** → **Branches** → **Branch protection rules**
2. Edit the `master` rule:
   - Enable "Require a pull request before merging"
   - Enable "Require approvals" (1-2 reviewers)
   - Enable "Require status checks to pass before merging"
   - Enable "Require branches to be up to date before merging"
   - Enable "Require code reviews before merging"
   - **Enable "Dismiss stale pull request approvals when new commits are pushed"**
   - **Enable "Require conversation resolution before merging"**
   - **Enable "Require commits to be signed"** (optional but recommended)
   - **IMPORTANT: Enable "Include administrators"** so admins must follow the rules too

## Quick Reference

```bash
# Start work on a feature
git checkout develop && git pull
git checkout -b feature/my-feature

# Make changes
git add . && git commit -m "feat: description"

# Push and create PR
git push origin feature/my-feature
# Then create PR on GitHub

# After PR is merged (locally clean up)
git checkout develop
git pull origin develop
git branch -d feature/my-feature
```

## Commit Message Convention

Follow this format for clarity:

```
type: Short description (50 chars max)

Optional longer explanation if needed.

type: feat, fix, docs, style, refactor, test, chore
```

Examples:
- `feat: Add admin panel for data management`
- `fix: Correct budget calculation for OHP phase`
- `docs: Update deployment instructions`
- `chore: Remove legacy files`
