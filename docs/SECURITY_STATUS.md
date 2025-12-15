# Security Status Dashboard

## 🛡️ Workflow Status

### Core Security Workflows

| Workflow | Status | Description | Last Run |
|----------|--------|-------------|----------|
| Daily Security Scan | [![Daily Security Scan](https://github.com/pinkycollie/NegraRosa/actions/workflows/daily-security-scan.yml/badge.svg)](https://github.com/pinkycollie/NegraRosa/actions/workflows/daily-security-scan.yml) | SAST, secrets detection, dependency scanning | Daily at 2 AM UTC |
| PR Security Review | [![PR Security Review](https://github.com/pinkycollie/NegraRosa/actions/workflows/pr-security-review.yml/badge.svg)](https://github.com/pinkycollie/NegraRosa/actions/workflows/pr-security-review.yml) | Automated security checks on pull requests | Per PR |
| Security Hardening | [![Security Hardening](https://github.com/pinkycollie/NegraRosa/actions/workflows/security-hardening.yml/badge.svg)](https://github.com/pinkycollie/NegraRosa/actions/workflows/security-hardening.yml) | Infrastructure and configuration hardening | Per PR |
| Generate SBOM | [![Generate SBOM](https://github.com/pinkycollie/NegraRosa/actions/workflows/generate-sbom.yml/badge.svg)](https://github.com/pinkycollie/NegraRosa/actions/workflows/generate-sbom.yml) | Software Bill of Materials generation | Weekly on Sunday |

### Deployment & Quality

| Workflow | Status | Description | Frequency |
|----------|--------|-------------|-----------|
| Deploy to GitHub Pages | [![Deploy to GitHub Pages](https://github.com/pinkycollie/NegraRosa/actions/workflows/deploy-gh-pages.yml/badge.svg)](https://github.com/pinkycollie/NegraRosa/actions/workflows/deploy-gh-pages.yml) | Production deployment | On push to main |
| Agent Merge Policy | [![Agent Merge Policy](https://github.com/pinkycollie/NegraRosa/actions/workflows/agent-merge-policy.yml/badge.svg)](https://github.com/pinkycollie/NegraRosa/actions/workflows/agent-merge-policy.yml) | Automated merge strategy | Per PR |

## 📊 Security Metrics

### Scan Coverage

- **SAST (Static Analysis):** ✅ Semgrep
- **Secrets Detection:** ✅ Trivy
- **Dependency Scanning:** ✅ npm audit + Trivy
- **Container Scanning:** ⏳ Planned
- **Dynamic Analysis (DAST):** ⏳ Planned

### Vulnerability Response

| Severity | Target Response Time | Current Status |
|----------|---------------------|----------------|
| Critical | 24 hours | ✅ On track |
| High | 7 days | ✅ On track |
| Medium | 30 days | ✅ On track |
| Low | 90 days | ✅ On track |

## 🔐 Security Practices

### Active Security Rituals

- [x] **Daily/Per-Commit**
  - [x] Automated code scanning (SAST)
  - [x] Secrets detection
  - [x] Dependency vulnerability scanning

- [x] **Weekly/Per-PR**
  - [x] Mandatory peer review
  - [x] Dependency health checks
  - [x] Branch protection enforcement

- [x] **Quarterly/Long-Term**
  - [x] SBOM generation
  - [ ] Threat modeling sessions (schedule quarterly)
  - [ ] Security training (schedule quarterly)
  - [ ] Dynamic security testing (DAST)

## 📁 Security Artifacts

### Latest Reports

- [Software Bill of Materials (SBOM)](sbom/)
- [Threat Models](../README.md#threat-modeling) *(Coming soon)*
- [Security Audit Results](../README.md#security-audits) *(Coming soon)*

### Documentation

- [Security Rituals Framework](SECURITY_RITUALS.md)
- [Threat Modeling Template](THREAT_MODELING_TEMPLATE.md)
- [Security Training Guide](SECURITY_TRAINING.md)
- [PASETO Authentication](PASETO_AUTHENTICATION.md)

## 🚨 Security Contacts

### Reporting Vulnerabilities

If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. **Email:** [Create security policy with contact]
3. **Expected response time:** 48 hours

### Security Team

- **Security Council:** Review security policies and incidents
- **Security Champions:** Promote security best practices within teams

## 🏆 Security Achievements

- ✅ Implemented comprehensive security scanning
- ✅ Established security rituals framework
- ✅ Generated and maintain SBOM
- ✅ Automated dependency updates (Dependabot)
- ✅ Branch protection with required reviews

## 📈 Improvement Roadmap

### Q1 2025
- [ ] Implement DAST scanning
- [ ] Conduct first quarterly threat modeling session
- [ ] Deploy security training program
- [ ] Set up security metrics dashboard

### Q2 2025
- [ ] Container security scanning
- [ ] API security testing
- [ ] Automated penetration testing
- [ ] Security compliance certification

### Q3 2025
- [ ] Bug bounty program
- [ ] Advanced threat detection
- [ ] Security incident response drills
- [ ] Third-party security audit

## 🔗 Quick Links

- [View all workflows](https://github.com/pinkycollie/NegraRosa/actions)
- [Security advisories](https://github.com/pinkycollie/NegraRosa/security/advisories)
- [Dependabot alerts](https://github.com/pinkycollie/NegraRosa/security/dependabot)
- [Code scanning alerts](https://github.com/pinkycollie/NegraRosa/security/code-scanning)

---

**Last Updated:** 2025-12-15  
**Next Review:** Quarterly (March 2026)

*This dashboard is automatically updated by the security workflows. Check the [Actions page](https://github.com/pinkycollie/NegraRosa/actions) for real-time status.*
