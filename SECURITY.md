# Security Policy

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report vulnerabilities to:

**security@mbtq.dev**

Include the following information:
- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

We will respond to your report within **48 hours** with an initial assessment and timeline for a fix.

## Disclosure Policy

When we receive a security bug report, we will:

1. **Confirm the problem** and determine affected versions
2. **Audit code** to find any similar problems
3. **Prepare fixes** for all supported releases
4. **Release patches** as quickly as possible

We follow a **90-day coordinated disclosure** policy:
- We will keep you informed of our progress
- We will credit you in the release notes (unless you prefer to remain anonymous)
- We will publicly disclose the vulnerability 90 days after the initial report or after a patch is released, whichever comes first

## Security Best Practices for Contributors

### Code Contributions

1. **Never commit secrets**: API keys, passwords, private keys, or tokens must never be committed to the repository
2. **Validate inputs**: All user inputs must be validated and sanitized
3. **Use parameterized queries**: Prevent SQL injection by using parameterized queries or ORM methods
4. **Escape outputs**: Prevent XSS by properly escaping all user-generated content
5. **Implement rate limiting**: All API endpoints should have appropriate rate limits

### Dependencies

1. **Pin versions**: Use exact versions in package.json (no `^` or `~`)
2. **Audit regularly**: Run `npm audit` before submitting PRs
3. **Update promptly**: Apply security patches within 48 hours of disclosure

### Authentication & Authorization

1. **Use short-lived tokens**: Session tokens should expire within 15 minutes
2. **Implement MFA**: Require multi-factor authentication for sensitive operations
3. **Principle of least privilege**: Grant minimal permissions necessary
4. **Rotate credentials**: Rotate secrets regularly (monthly for keys, quarterly for partner tokens)

### Data Protection

1. **Encrypt PII**: All personally identifiable information must be encrypted at rest
2. **Minimize data collection**: Only collect data that is absolutely necessary
3. **Implement redaction**: Use middleware to redact PII from logs and non-essential responses
4. **Default to ephemeral**: Use `PERSISTENCE=false` in development and testing

## Security Contacts

- **Primary contact**: security@mbtq.dev
- **Security council**: @security-council (GitHub team)
- **Emergency escalation**: security-urgent@mbtq.dev

## Supported Versions

We currently support security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Features

### Current Implementations

- **Authentication**: Paseto v4 public tokens with Ed25519 signing
- **Rate Limiting**: 100 requests/minute per IP, 1000 requests/hour per API key
- **Input Validation**: Zod schema validation on all API endpoints
- **PII Redaction**: Middleware-based redaction for sensitive data
- **Audit Logging**: All agent actions logged to append-only audit store
- **Webhook Security**: HMAC SHA-256 with single-use nonces

### Upcoming Enhancements

- Event signing with Ed25519 for audit logs
- Automated key rotation system
- Supply-chain attestations (SLSA provenance)
- Enhanced anomaly detection and alerting

## Security Roadmap

See [agents.md](./agents.md#practical-security-roadmap) for detailed security implementation roadmap.

## Incident Response

In case of a security incident:

1. **Immediate containment**: Set `EMERGENCY_LOCKDOWN=true` to disable all agent actions
2. **Rotate credentials**: Run `npm run rotate-keys --emergency`
3. **Notify security team**: Email security@mbtq.dev with incident details
4. **Document**: Create postmortem in `docs/incidents/`

For detailed incident response procedures, see [agents.md](./agents.md#observability-and-runbook).

## Compliance

NegraRosa is committed to:

- **Data Minimization**: Collecting only necessary data
- **User Control**: Users maintain control over their data and identity
- **Transparency**: Clear documentation of data handling practices
- **Accountability**: Comprehensive audit logging of all actions

## Security Training

All contributors are expected to:

- Review this security policy before contributing
- Complete security training (30-minute walkthrough available)
- Follow the secure coding guidelines in [agents.md](./agents.md)
- Participate in quarterly security reviews

## Acknowledgments

We thank the security researchers and contributors who help keep NegraRosa secure. Security researchers who responsibly disclose vulnerabilities will be acknowledged in our release notes (with their permission).

---

**Last Updated**: 2025-12-06  
**Contact**: security@mbtq.dev
