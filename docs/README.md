# NegraRosa Documentation

This directory contains comprehensive documentation for the NegraRosa Inclusive Security Framework.

## Directory Structure

```
docs/
├── partner_integration_api.md  # API specifications for third-party partner integrations
├── templates/                  # Templates for various documentation needs
│   └── incident-template.md   # Security incident report template
└── incidents/                  # Directory for security incident postmortems
    └── .gitkeep               # Keep this directory in git
```

## Core Documentation Files

Located in the root directory:

- **[agents.md](../agents.md)** - Comprehensive agent documentation with security policies, capabilities, and operational procedures
- **[SECURITY.md](../SECURITY.md)** - Security policy, vulnerability reporting, and security best practices
- **[README.md](../README.md)** - Project overview and getting started guide
- **[DEPLOY.md](../DEPLOY.md)** - Deployment instructions for Vercel and other platforms

## Documentation Guidelines

### For Contributors

1. **Keep documentation up-to-date**: Update relevant docs when making code changes
2. **Use templates**: Use provided templates for consistency (incident reports, PRs, etc.)
3. **Link related docs**: Cross-reference related documentation
4. **Security-first**: Always consider security implications and document them

### For Security Incidents

1. Use the [incident template](./templates/incident-template.md)
2. Store completed incident reports in `incidents/` directory
3. Name format: `incidents/YYYY-MM-DD-brief-description.md`
4. Ensure PII is redacted before committing
5. Notify security@mbtq.dev when creating new incident reports

### For API Changes

1. Update [partner_integration_api.md](./partner_integration_api.md) for partner-facing APIs
2. Update [agents.md](../agents.md) for agent-related APIs
3. Include request/response examples
4. Document authentication and rate limits
5. Update OpenAPI specs if available

## Documentation Standards

### Markdown Style

- Use ATX-style headers (`#`, `##`, etc.)
- Include a table of contents for long documents
- Use code blocks with language specification
- Use tables for structured data
- Include examples for API endpoints and configurations

### Code Examples

- Use realistic but non-sensitive example data
- Include full curl commands for API examples
- Show both request and response
- Document expected status codes and error conditions

### Security Documentation

- **Never** include real secrets, API keys, or credentials
- Use placeholders like `your-api-key-here` or `sk_test_xxx`
- Document security implications clearly
- Link to [SECURITY.md](../SECURITY.md) for general security practices

## Quick Links

### Security & Compliance
- [Agent Documentation](../agents.md)
- [Security Policy](../SECURITY.md)
- [Incident Template](./templates/incident-template.md)

### Development
- [Getting Started](../README.md)
- [Deployment Guide](../DEPLOY.md)
- [Environment Variables](../.env.example)

### Integration
- [Partner Integration API](./partner_integration_api.md)

## Contact

For documentation questions or suggestions:
- Open an issue in the repository
- Contact the maintainers via pull request
- For security-related documentation: security@mbtq.dev

## Contributing to Documentation

1. Read the existing documentation to understand the style and structure
2. Make changes in a feature branch
3. Follow the PR template in [.github/PULL_REQUEST_TEMPLATE](../.github/PULL_REQUEST_TEMPLATE/pull_request_template.md)
4. Request review from documentation maintainers
5. Update the "Last Updated" date in the document you modified

---

**Last Updated**: 2025-12-06  
**Maintained by**: NegraRosa Team
