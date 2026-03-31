# NegraRosa - Inclusive Security Framework

[![Security Hardening](https://github.com/pinkycollie/NegraRosa/actions/workflows/security-hardening.yml/badge.svg)](https://github.com/pinkycollie/NegraRosa/actions/workflows/security-hardening.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

NegraRosa is an Inclusive Security Framework that empowers individuals to control their identity and personal data through NFT-based authentication and decentralized verification. The framework enables users to share verified identity information with third-party partners while maintaining full control over their data.

### Key Features

- **NFT-Based Identity** - "I AM WHO I AM" NFT as central identity token
- **User-Controlled Data Sharing** - Granular permission controls for data access
- **Partner Integration Hub** - Seamless integration with third-party verification services
- **Zero-Custody Model** - No custody of user credentials or private keys
- **Comprehensive Audit Trail** - All actions logged to append-only audit store
- **Security-First Architecture** - Built on security pillars with automated checks

## Quick Start

Get started in minutes:

```bash
# Clone the repository
git clone https://github.com/pinkycollie/NegraRosa.git
cd NegraRosa

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

For detailed setup instructions, see [QUICKSTART.md](./QUICKSTART.md).

## Documentation

### Core Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide for developers
- **[agents.md](./agents.md)** - Comprehensive agent documentation with security policies
- **[SECURITY.md](./SECURITY.md)** - Security policy and vulnerability reporting
- **[DEPLOY.md](./DEPLOY.md)** - Deployment instructions for Vercel

### API Documentation

- **[Partner Integration API](./docs/partner_integration_api.md)** - API specifications for third-party integrations
- **[docs/README.md](./docs/README.md)** - Documentation structure and guidelines

### Templates

- **[PR Template](./.github/PULL_REQUEST_TEMPLATE/pull_request_template.md)** - Pull request checklist
- **[Incident Template](./docs/templates/incident-template.md)** - Security incident reporting

## Architecture

### Security Pillars

NegraRosa is built on seven security pillars:

1. **Identity & Access** - Paseto v4 tokens, short TTL, MFA, RBAC
2. **Code & CI Hygiene** - Pinned deps, SCA, spectral checks, import bans
3. **Data Minimization** - Redaction middleware, no PII persistence by default
4. **Infrastructure** - Domain separation, WAF, rate limits
5. **Supply-chain** - CVE monitoring, rapid backports, SBOM generation
6. **Observability** - Health checks, metrics, audit trails, incident playbook
7. **AI Safety** - Model input/output validation, prompt logging, policy enforcement

For detailed information, see [agents.md](./agents.md#security-pillars-framework).

### Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Paseto v4, Passport.js
- **Blockchain**: Ethereum (for NFT verification)
- **Integrations**: Stripe, Plaid, Auth0, Civic, OpenAI, Anthropic

## Development

### Prerequisites

- Node.js 20+
- PostgreSQL
- Git

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run check        # TypeScript type checking
npm test             # Run tests
npm run db:push      # Push database schema changes
npm audit            # Security vulnerability check
```

### Project Structure

```
NegraRosa/
├── .github/          # GitHub workflows and templates
├── api/              # API routes
├── client/           # React frontend
├── server/           # Backend server
│   ├── api/         # API endpoints
│   └── services/    # Business logic
├── docs/            # Documentation
├── shared/          # Shared code
└── agents.md        # Agent documentation
```

## Security

### Reporting Vulnerabilities

**Do not report security vulnerabilities through public GitHub issues.**

Email security concerns to: **security@mbtq.dev**

See [SECURITY.md](./SECURITY.md) for detailed reporting guidelines.

### Security Best Practices

- Never commit secrets to the repository
- Use environment variables for sensitive configuration
- Set `PERSISTENCE=false` in development
- Follow the [agents.md](./agents.md) security guidelines
- Run `npm audit` before submitting PRs

## Contributing

We welcome contributions! Before contributing:

1. Read [agents.md](./agents.md) for security guidelines
2. Review [SECURITY.md](./SECURITY.md) for security practices
3. Check the [PR template](./.github/PULL_REQUEST_TEMPLATE/pull_request_template.md)
4. Follow the coding standards in existing code

### Contribution Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Run security checks (`npm audit`, `npm run check`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

All PRs require:
- Passing CI checks
- Security council review (for security-critical changes)
- Updated documentation

## Deployment

Deploy to Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/pinkycollie/NegraRosa/issues)
- **Security**: security@mbtq.dev
- **General inquiries**: Open a discussion on GitHub

## Roadmap

### Immediate Priorities
- Pin runtime versions
- Address high/critical CVEs
- Deploy redaction middleware
- Implement Paseto v4 tokens

### Medium-term Goals
- Event signing with Ed25519
- Automated key rotation
- Supply-chain attestations
- SBOM generation

### Long-term Vision
- Multi-chain NFT support
- Advanced AI-powered verification
- Decentralized identity network
- Open source ecosystem

See [agents.md](./agents.md#practical-security-roadmap) for detailed security roadmap.

## Acknowledgments

- Security researchers who help keep NegraRosa secure
- Open source community for amazing tools and libraries
- Contributors who make this project possible

---

**Built with ❤️ by the NegraRosa Team**

For questions or support, open an issue or contact us at security@mbtq.dev
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
