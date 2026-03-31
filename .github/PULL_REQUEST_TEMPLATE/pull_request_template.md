## Description

<!-- Provide a clear and concise description of your changes -->

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Security fix
- [ ] Performance improvement
- [ ] Code refactoring

## Agent Security Checklist

<!-- If this PR involves agent code or API changes, complete this checklist -->

- [ ] No DB imports in `/api/*` (import ban enforced in CI)
- [ ] SCA (npm audit) has no high/critical CVEs
- [ ] `SECURITY.md` reviewed and up-to-date
- [ ] Agent code has corresponding unit tests
- [ ] Audit logging implemented for all agent actions
- [ ] Secrets stored in KMS (not in repo or env files)
- [ ] Preview deployment tested and verified
- [ ] security@mbtq.dev notified if introducing new capabilities

### Planned Future Checks
- [ ] Spectral OpenAPI checks (to be configured)
- [ ] PII output tests (to be implemented)

## Testing Checklist

- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Tested in preview environment
- [ ] No TypeScript errors (`npm run check`)
- [ ] Build succeeds (`npm run build`)

## Security Considerations

<!-- Answer these questions for any PR that touches sensitive areas -->

- [ ] Does this PR handle user data? If yes, is PII properly redacted?
- [ ] Does this PR add new API endpoints? If yes, are they properly authenticated and rate-limited?
- [ ] Does this PR modify authentication/authorization logic? If yes, has it been reviewed by security council?
- [ ] Does this PR add new dependencies? If yes, have they been audited for vulnerabilities?
- [ ] Does this PR expose new functionality to external partners? If yes, has security@mbtq.dev been notified?

## Documentation

- [ ] README.md updated (if applicable)
- [ ] API documentation updated (if applicable)
- [ ] agents.md updated (if agent capabilities changed)
- [ ] SECURITY.md updated (if security practices changed)
- [ ] Code comments added for complex logic

## Dependencies

<!-- List any dependencies added or updated -->

- [ ] All new dependencies have been reviewed for security vulnerabilities
- [ ] Dependencies are pinned to exact versions (no ^ or ~)
- [ ] SBOM updated (if applicable)

## Screenshots/Videos

<!-- If this PR includes UI changes, add screenshots or videos here -->

## Rollback Plan

<!-- Describe how to rollback this change if issues arise in production -->

## Additional Notes

<!-- Any additional information reviewers should know -->

---

**By submitting this PR, I confirm that:**
- I have read and followed the [agents.md](../../agents.md) guidelines
- I have reviewed the [SECURITY.md](../../SECURITY.md) policy
- I understand that agent PRs require security council approval
- I will address all review comments before merge
