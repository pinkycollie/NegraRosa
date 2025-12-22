[![Security Hardening](https://github.com/pinkycollie/NegraRosa/actions/workflows/security-hardening.yml/badge.svg)](https://github.com/pinkycollie/NegraRosa/actions/workflows/security-hardening.yml)
[![Daily Security Scan](https://github.com/pinkycollie/NegraRosa/actions/workflows/daily-security-scan.yml/badge.svg)](https://github.com/pinkycollie/NegraRosa/actions/workflows/daily-security-scan.yml)
[![PR Security Review](https://github.com/pinkycollie/NegraRosa/actions/workflows/pr-security-review.yml/badge.svg)](https://github.com/pinkycollie/NegraRosa/actions/workflows/pr-security-review.yml)
[![Generate SBOM](https://github.com/pinkycollie/NegraRosa/actions/workflows/generate-sbom.yml/badge.svg)](https://github.com/pinkycollie/NegraRosa/actions/workflows/generate-sbom.yml)
[![Deploy to GitHub Pages](https://github.com/pinkycollie/NegraRosa/actions/workflows/deploy-gh-pages.yml/badge.svg)](https://github.com/pinkycollie/NegraRosa/actions/workflows/deploy-gh-pages.yml)

# NegraRosa Inclusive Security Framework

Welcome to NegraRosa, an innovative security and identity verification framework.

## 🔒 Security First

NegraRosa implements comprehensive security practices integrated into every stage of development:

- **Daily Security Scans:** Automated SAST, secrets detection, and dependency scanning
- **Per-Commit Protection:** Every code change is analyzed before merge
- **Continuous Monitoring:** Real-time vulnerability tracking and response
- **Security Rituals:** Systematic practices at daily, weekly, and quarterly frequencies

📊 [View Security Status Dashboard](docs/SECURITY_STATUS.md) | 📚 [Security Documentation](docs/SECURITY_RITUALS.md)

## 🤖 Automated Merge Agent

This repository uses an intelligent merge agent that:
- **Auto-suggests** merge strategies (squash/rebase/merge) based on PR characteristics
- **Auto-merges** when safe: CI passes ✅, has approval ✅, not draft ✅
- **Deletes branches** automatically after merge

**For maintainers:** Use labels `force-squash`, `force-rebase`, `force-merge`, or `do-not-merge` to control behavior.

📖 [Full documentation](docs/agent-merge-policy.md) | 💬 Contact: Security Council

---

## 📚 Documentation

### Security
- [Security Rituals Framework](docs/SECURITY_RITUALS.md) - Comprehensive security practices
- [Security Status Dashboard](docs/SECURITY_STATUS.md) - Real-time security metrics and workflow status
- [Security Training Guide](docs/SECURITY_TRAINING.md) - Developer security training materials
- [Threat Modeling Template](docs/THREAT_MODELING_TEMPLATE.md) - Template for security analysis
- [PASETO Authentication](docs/PASETO_AUTHENTICATION.md) - Authentication implementation

### Development
- [Agent Merge Policy](docs/agent-merge-policy.md) - Automated merge strategy
- [Partner Integration API](docs/partner_integration_api.md) - API documentation
- [Deployment Guide](DEPLOY.md) - Vercel deployment instructions

### Project
- [Main Documentation](docs/README.md) - Complete documentation index

---

## 🚀 Deployment

The application is automatically deployed to GitHub Pages on every push to `main`:
- **Live URL:** [https://pinkycollie.github.io/NegraRosa/](https://pinkycollie.github.io/NegraRosa/)
- **Deployment Status:** [![Deploy to GitHub Pages](https://github.com/pinkycollie/NegraRosa/actions/workflows/deploy-gh-pages.yml/badge.svg)](https://github.com/pinkycollie/NegraRosa/actions/workflows/deploy-gh-pages.yml)

For manual deployment instructions and other platforms, see [DEPLOY.md](DEPLOY.md).

---

## 🛡️ Security Reporting

If you discover a security vulnerability, please follow our responsible disclosure process:
1. **DO NOT** create a public issue
2. Contact the Security Council immediately
3. Provide detailed information about the vulnerability

See [Security Status Dashboard](docs/SECURITY_STATUS.md) for contact information.

---

For more information, see the [documentation](docs/README.md).
