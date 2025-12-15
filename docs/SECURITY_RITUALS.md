# Security Rituals Framework

This document outlines the systematic security practices integrated into the NegraRosa development workflow.

## 🔁 Daily & Per-Commit Rituals

These automated checks run on every commit and act as the first line of defense.

### Automated Code Scanning (SAST)
**Tool:** Semgrep  
**Frequency:** Every push, PR, and daily at 2 AM UTC  
**Workflow:** `.github/workflows/daily-security-scan.yml`

Semgrep performs static analysis to detect security vulnerabilities, code quality issues, and anti-patterns without executing the code.

### Secrets Detection
**Tool:** Trivy  
**Frequency:** Every push, PR, and daily  
**Workflow:** `.github/workflows/daily-security-scan.yml`

Automatically scans for accidentally exposed API keys, passwords, tokens, and other sensitive information in the codebase and commit history.

### Software Composition Analysis (SCA)
**Tools:** npm audit + Trivy  
**Frequency:** Every push, PR, and daily  
**Workflow:** `.github/workflows/daily-security-scan.yml`

Identifies known vulnerabilities in dependencies the moment they're added to the project.

## 📅 Weekly & Per-Pull Request Rituals

These rituals involve human review and strategic decisions before code is merged.

### Mandatory Peer Review
**Enforcement:** Branch protection rules  
**Workflow:** `.github/workflows/pr-security-review.yml`

No code merges without review from another developer. This "second set of eyes" catches logic flaws and complex security issues that automated tools miss.

**PR Security Checklist:**
- [ ] Code follows security best practices
- [ ] No hardcoded secrets or credentials
- [ ] Input validation for user-facing features
- [ ] Error handling doesn't leak sensitive information
- [ ] Dependencies are from trusted sources

### Dependency Health Review
**Workflow:** `.github/workflows/pr-security-review.yml`

When adding or updating dependencies, the workflow automatically:
1. Detects new dependencies
2. Runs vulnerability scans
3. Posts a security review comment on the PR

**Manual Review Checklist:**
- Is the dependency actively maintained? (last update < 6 months)
- Is it widely used and trusted? (check npm downloads, GitHub stars)
- Are there security advisories? (check npm audit, GitHub Security)
- Do we really need it? (avoid unnecessary dependencies)

### Protected Branches
**Configuration:** Repository settings

Branch protection for `main`:
- ✅ Require PR before merging
- ✅ Require status checks to pass
- ✅ Require at least 1 approval
- ✅ Dismiss stale reviews on push
- ❌ No direct pushes allowed

## 🗓️ Quarterly & Long-Term Rituals

These practices shape the overall security posture and adapt to new threats.

### Threat Modeling Sessions
**Frequency:** Quarterly or for major features  
**Template:** `docs/THREAT_MODELING_TEMPLATE.md`

Regular analysis of new features or major changes:
1. **What are we building?** Describe the feature and architecture
2. **What can go wrong?** Identify potential threats using STRIDE
3. **What are we doing to defend it?** Document mitigations

### Software Bill of Materials (SBOM)
**Tools:** CycloneDX, Syft  
**Frequency:** Weekly generation, updated on releases  
**Workflow:** `.github/workflows/generate-sbom.yml`

Maintains an inventory of all components for quick vulnerability impact assessment.

**SBOM Formats:**
- CycloneDX JSON (industry standard)
- SPDX JSON (Linux Foundation standard)

**Location:** `docs/sbom/`

### Dependency Updates
**Tool:** Dependabot (GitHub native)  
**Configuration:** `.github/dependabot.yml`

Automated pull requests for security updates with:
- Changelog information
- Compatibility analysis
- Automated testing

## 🛠️ Security Workflow Status

Monitor security workflows on the [Actions page](../../actions):

| Workflow | Status | Purpose |
|----------|--------|---------|
| Daily Security Scan | ![Daily Security Scan](../../actions/workflows/daily-security-scan.yml/badge.svg) | SAST, secrets, dependencies |
| PR Security Review | ![PR Security Review](../../actions/workflows/pr-security-review.yml/badge.svg) | Pre-merge security checks |
| Generate SBOM | ![Generate SBOM](../../actions/workflows/generate-sbom.yml/badge.svg) | Component inventory |
| Security Hardening | ![Security Hardening](../../actions/workflows/security-hardening.yml/badge.svg) | Infrastructure security |

## 📚 Additional Resources

- [Threat Modeling Template](THREAT_MODELING_TEMPLATE.md)
- [Security Training Guide](SECURITY_TRAINING.md)
- [Incident Response Plan](INCIDENT_RESPONSE.md)
- [Current SBOM](sbom/README.md)

## 🚀 Getting Started

### For Developers

1. **Before Committing:**
   - Run `npm audit` to check for vulnerabilities
   - Use git hooks (optional) for pre-commit secret scanning

2. **Opening a PR:**
   - Fill out the security checklist
   - Review automated security feedback
   - Request review from security-aware team members

3. **After Merging:**
   - Monitor workflow runs for any issues
   - Address any security findings promptly

### For Security Champions

1. **Weekly:**
   - Review open security findings from automated scans
   - Triage and assign vulnerability fixes
   - Check for stale dependency updates

2. **Quarterly:**
   - Conduct threat modeling session
   - Review and update security documentation
   - Assess security metrics and trends

3. **Annual:**
   - Comprehensive security audit
   - Update security training materials
   - Review and refine security processes

## 🔐 Security Contacts

For security concerns, contact:
- Security Council: [Contact information]
- Report vulnerabilities: [Security policy link]

---

**Remember:** Security is everyone's responsibility. When in doubt, ask!
