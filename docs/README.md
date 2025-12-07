# NegraRosa Documentation

Welcome to the NegraRosa documentation. This directory contains comprehensive guides and specifications for the NegraRosa Inclusive Security Framework.

## Available Documentation

- **[Agent Merge Policy](agent-merge-policy.md)** - Automated merge strategy agent that manages PR merging
- **[Partner Integration API](partner_integration_api.md)** - API specifications for third-party partner integrations

## Agent Merge Policy

NegraRosa uses an automated GitHub Action that intelligently manages pull request merging. The agent:

- 🤖 **Auto-suggests** merge strategies based on a deterministic rubric
- ✅ **Auto-merges** PRs when safe (CI green, approved, not draft, no blocking labels)
- 📦 **Enforces squash** for bot and documentation PRs
- 🗑️ **Deletes branches** automatically after merge

### Quick Start

The agent runs automatically on all PRs. No configuration needed!

**Auto-merge Conditions:**
- ✅ All CI checks passing
- ✅ At least one approved review
- ✅ Not a draft PR
- ✅ No `do-not-merge` label

**Override Labels:**
- `force-squash` - Force squash merge
- `force-rebase` - Force rebase merge
- `force-merge` - Force merge commit
- `do-not-merge` - Block auto-merge

For detailed information, see the [Agent Merge Policy documentation](agent-merge-policy.md).

## Security Council

For security concerns or questions about the NegraRosa framework:

- **GitHub Issues**: [Open an issue](https://github.com/pinkycollie/NegraRosa/issues)
- **Security Council**: Contact via repository maintainers

## Contributing

When contributing to NegraRosa:

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Open a pull request
4. The Agent Merge Policy will evaluate and suggest a merge strategy
5. Get at least one approval from a maintainer
6. The agent will auto-merge when all conditions are met

## Repository Structure

```
NegraRosa/
├── .github/
│   └── workflows/        # GitHub Actions workflows
├── docs/                 # Documentation (you are here)
├── client/              # Frontend application
├── server/              # Backend API
├── api/                 # API endpoints
├── shared/              # Shared utilities
└── ...
```

## Additional Resources

- [Main Repository](https://github.com/pinkycollie/NegraRosa)
- [Security Hardening Status](https://github.com/pinkycollie/NegraRosa/actions/workflows/security-hardening.yml)

---

_For questions or issues with this documentation, please open an issue in the repository._
