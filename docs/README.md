# NegraRosa Documentation

Welcome to the NegraRosa documentation. This directory contains comprehensive guides and specifications for the NegraRosa Inclusive Security Framework.

## 📚 Documentation Index

### 🔒 Security Documentation

- **[Security Rituals Framework](SECURITY_RITUALS.md)** - Comprehensive guide to security practices at daily, weekly, and quarterly frequencies
- **[Security Status Dashboard](SECURITY_STATUS.md)** - Real-time security metrics, workflow status, and security achievements
- **[Security Training Guide](SECURITY_TRAINING.md)** - Essential security training for all developers covering OWASP Top 10 and secure coding practices
- **[Threat Modeling Template](THREAT_MODELING_TEMPLATE.md)** - Template for conducting security threat analysis using the STRIDE model
- **[PASETO Authentication](PASETO_AUTHENTICATION.md)** - PASETO token-based authentication implementation

### 🤖 Development & Automation

- **[Agent Merge Policy](agent-merge-policy.md)** - Automated merge strategy agent that manages PR merging
- **[Partner Integration API](partner_integration_api.md)** - API specifications for third-party partner integrations

### 📦 Deployment

- **[Deployment Guide](../DEPLOY.md)** - Instructions for deploying to GitHub Pages and other platforms
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Comprehensive pre and post-deployment verification
- **[GitHub Pages Setup](GITHUB_PAGES_SETUP.md)** - Detailed GitHub Pages configuration guide

### 📋 Repository Management

- **[Audit Report](AUDIT_REPORT.md)** - Comprehensive repository audit and optimization report
- **[File Structure](FILE_STRUCTURE.md)** - Complete documentation of repository organization and file structure
- **[Compliance Report](COMPLIANCE_REPORT.md)** - Security, accessibility, and standards compliance documentation

## 🛡️ Security First Approach

NegraRosa implements a comprehensive security framework with systematic rituals:

### Daily & Per-Commit Rituals
- ✅ **Automated Code Scanning (SAST)** - Semgrep scans every commit
- ✅ **Secrets Detection** - Trivy prevents accidental exposure of credentials
- ✅ **Dependency Scanning** - npm audit + Trivy identify vulnerable packages

### Weekly & Per-PR Rituals
- ✅ **Mandatory Peer Review** - No code merges without review
- ✅ **Dependency Health Checks** - Automated review of new dependencies
- ✅ **Branch Protection** - Enforced through GitHub settings

### Quarterly & Long-Term Rituals
- ✅ **SBOM Generation** - Automated inventory of all components
- 📅 **Threat Modeling** - Security analysis for new features
- 📅 **Security Training** - Regular developer education
- 📅 **Dynamic Testing** - Runtime security testing

**[View Live Security Status →](SECURITY_STATUS.md)**

## 🚀 Quick Start for Developers

### Understanding Security Workflows

All security workflows are automated and run on specific triggers:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| Daily Security Scan | Push, PR, Daily 2AM | SAST + Secrets + Dependencies |
| PR Security Review | Pull Request | Pre-merge security checks |
| Generate SBOM | Weekly/Release | Component inventory |
| Deploy to GitHub Pages | Push to main | Production deployment |

### Before You Commit

1. **Run local checks:**
   ```bash
   npm audit          # Check for vulnerabilities
   npm run check      # TypeScript validation
   ```

2. **Review your changes:**
   - No hardcoded secrets?
   - Input validation added?
   - Error handling secure?

3. **Commit with clear messages:**
   ```bash
   git commit -m "feat: add user validation with input sanitization"
   ```

### Opening a Pull Request

1. Create feature branch from `main`
2. Make changes with security in mind
3. Open PR - automated security review runs
4. Address any security findings
5. Get at least one approval
6. Agent auto-merges when safe

## Agent Merge Policy

NegraRosa uses an automated GitHub Action that intelligently manages pull request merging. The agent:

- 🤖 **Auto-suggests** merge strategies based on a deterministic rubric
- ✅ **Auto-merges** PRs when safe (CI green, approved, not draft, no blocking labels)
- 📦 **Enforces squash** for bot and documentation PRs
- 🗑️ **Deletes branches** automatically after merge

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

## 🔐 Security Reporting

If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. Contact the Security Council immediately
3. Follow our responsible disclosure process

See [Security Status Dashboard](SECURITY_STATUS.md) for contact information.

## 📁 Repository Structure

```
NegraRosa/
├── .github/
│   ├── workflows/           # GitHub Actions workflows
│   │   ├── daily-security-scan.yml
│   │   ├── pr-security-review.yml
│   │   ├── generate-sbom.yml
│   │   ├── deploy-gh-pages.yml
│   │   └── ...
│   └── dependabot.yml      # Automated dependency updates
├── docs/                    # Documentation (you are here)
│   ├── SECURITY_RITUALS.md
│   ├── SECURITY_STATUS.md
│   ├── SECURITY_TRAINING.md
│   ├── THREAT_MODELING_TEMPLATE.md
│   ├── sbom/               # Software Bill of Materials
│   └── ...
├── client/                 # Frontend application
├── server/                 # Backend API
├── api/                    # API endpoints
├── shared/                 # Shared utilities
└── ...
```

## 🏆 Security Achievements

- ✅ Comprehensive security scanning (SAST + SCA + Secrets)
- ✅ Automated dependency updates (Dependabot)
- ✅ Software Bill of Materials (SBOM) generation
- ✅ Security rituals framework
- ✅ Security training materials
- ✅ Threat modeling template
- ✅ Branch protection with required reviews
- ✅ Automated merge strategy
- ✅ GitHub Pages deployment

## 📖 Learning Resources

### For Security Champions
1. Start with [Security Rituals Framework](SECURITY_RITUALS.md)
2. Review [Security Status Dashboard](SECURITY_STATUS.md)
3. Conduct threat modeling using [Threat Modeling Template](THREAT_MODELING_TEMPLATE.md)
4. Lead security training sessions with [Security Training Guide](SECURITY_TRAINING.md)

### For All Developers
1. Complete [Security Training Guide](SECURITY_TRAINING.md)
2. Understand [Security Rituals Framework](SECURITY_RITUALS.md)
3. Review PRs with security in mind
4. Report security issues responsibly

## 🌐 Additional Resources

- [Main Repository](https://github.com/pinkycollie/NegraRosa)
- [Security Workflows Status](https://github.com/pinkycollie/NegraRosa/actions)
- [Security Advisories](https://github.com/pinkycollie/NegraRosa/security/advisories)
- [Dependabot Alerts](https://github.com/pinkycollie/NegraRosa/security/dependabot)

## 🤝 Contributing

We welcome contributions that improve security and functionality:

1. Fork the repository
2. Create a feature branch
3. Make your changes following security best practices
4. Add tests if applicable
5. Submit a pull request
6. Respond to automated security reviews
7. Get approval from maintainers

**Security-focused contributions are especially valued!**

---

_For questions or issues with this documentation, please open an issue in the repository._
