# Agent Merge Policy

## Overview

The Agent Merge Policy is an automated GitHub Action that intelligently suggests and applies merge strategies for pull requests in the NegraRosa repository. The agent follows a deterministic rubric to ensure consistent, safe, and appropriate merging practices across the ecosystem.

## How It Works

The agent is triggered automatically on pull request events:
- When a PR is opened
- When labels are added or removed
- When a PR is marked ready for review
- When new commits are pushed (synchronize)
- When a PR is reopened or edited

On each trigger, the agent:
1. **Analyzes** the PR metadata (author, files, commits, labels, reviews, CI status)
2. **Suggests** a merge strategy based on the decision rubric
3. **Posts a comment** with the suggestion and current status
4. **Auto-merges** if all safety conditions are met
5. **Deletes the source branch** after a successful merge

## Decision Rubric

The agent follows this deterministic rubric to choose a merge strategy:

### Priority 1: Blocking Conditions

1. **Draft PR** → Comment and exit, no merge
2. **`do-not-merge` label** → Comment and exit, no merge

### Priority 2: Override Labels

If any of these labels are present, the agent uses the requested strategy:

- `force-squash` → Use **squash** merge
- `force-rebase` → Use **rebase** merge  
- `force-merge` → Use **merge commit**

### Priority 3: Automatic Strategy Selection

If no override labels are present, the agent applies these rules in order:

1. **Bot or docs-only PR** → **Squash** merge
   - Author is a bot (user type is 'Bot', login ends with `[bot]`, or contains 'bot')
   - OR all changed files are documentation-only:
     - Files under `docs/` or `.github/`
     - Markdown files (`.md`)
     - `SECURITY.md` or `.env.example`

2. **Multiple authors with many commits** → **Merge commit**
   - More than 1 distinct commit author
   - AND 5 or more commits

3. **Default** → **Rebase** merge
   - Single author or fewer commits

## Auto-merge Conditions

The agent will **automatically merge** a PR only when ALL of the following conditions are true:

1. ✅ **Mergeable state** is `clean`, `unstable`, or `has_hooks`
2. ✅ **All required CI checks** have passed (status is `success`)
3. ✅ **At least one approved review** is present
4. ✅ **Not a draft** PR
5. ✅ **No `do-not-merge` label**

If any condition is not met, the agent will post a comment explaining what's missing but will **not** merge automatically.

## Available Labels

Maintainers can use these labels to control the agent's behavior:

| Label | Effect |
|-------|--------|
| `force-squash` | Force squash merge strategy |
| `force-rebase` | Force rebase merge strategy |
| `force-merge` | Force merge commit strategy |
| `do-not-merge` | Block auto-merge (manual merge required) |
| `automerge` | No special effect (informational only) |

## Manual Override

If you need to merge a PR manually:

1. Add the `do-not-merge` label to prevent the agent from auto-merging
2. Merge the PR using GitHub's merge button with your preferred strategy
3. The agent will respect your manual merge and not interfere

## Branch Deletion

After a successful auto-merge, the agent automatically deletes the source branch to keep the repository clean. If branch deletion fails (e.g., branch protection rules), the agent will note this in the comment but the merge will still succeed.

## Audit Trail

Every evaluation by the agent results in a comment on the PR that includes:

- Suggested merge strategy and reasoning
- Current CI status
- Number of approved reviews
- Mergeable state
- Whether auto-merge was attempted
- Success or failure details

This provides a complete audit trail of the agent's decisions.

## Safety & Security

The agent uses the `pull_request_target` trigger with minimal permissions:

```yaml
permissions:
  pull-requests: write  # To comment and merge PRs
  contents: write       # To delete branches
  issues: write         # To post comments
  checks: read          # To read CI status
```

The agent will **never**:
- Merge a PR with failing CI checks
- Merge a PR without at least one approval
- Merge a draft PR
- Merge a PR with the `do-not-merge` label
- Override branch protection rules

## Adopting in Other Repositories

To adopt this workflow in another NegraRosa microservice repository:

1. Copy `.github/workflows/agent-merge-policy.yml` to your repository
2. Copy `docs/agent-merge-policy.md` to your repository
3. Configure branch protection rules if needed
4. Add a note in your README about the agent behavior

No additional configuration or secrets are required - the workflow uses the standard `GITHUB_TOKEN`.

## Contact

For questions, issues, or security concerns about the Agent Merge Policy:

- Open an issue in the NegraRosa repository
- Contact the NegraRosa Security Council via repository maintainers

## Examples

### Example 1: Bot PR with Docs Changes

A Dependabot PR updating `README.md`:
- **Author**: `dependabot[bot]`
- **Strategy**: Squash
- **Reason**: Bot PR
- **Auto-merge**: Yes (if CI passes and approved)

### Example 2: Collaborative Feature PR

A feature PR with 3 developers and 8 commits:
- **Authors**: 3 distinct developers
- **Commits**: 8
- **Strategy**: Merge commit
- **Reason**: Multiple authors with 8 commits
- **Auto-merge**: Yes (if CI passes and approved)

### Example 3: Single Developer Fix

A bug fix with 2 commits from one developer:
- **Authors**: 1
- **Commits**: 2
- **Strategy**: Rebase
- **Reason**: Single author or few commits
- **Auto-merge**: Yes (if CI passes and approved)

### Example 4: Manual Merge Required

A complex PR that needs manual review:
1. Add `do-not-merge` label
2. Agent will comment but not auto-merge
3. Review and merge manually when ready
4. Remove label for future auto-merge capability

---

_This document describes version 1.0 of the Agent Merge Policy. Last updated: December 2025._
