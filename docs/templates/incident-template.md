# Security Incident Report Template

**Incident ID**: INC-YYYY-MM-DD-NNN  
**Date Detected**: YYYY-MM-DD HH:MM UTC  
**Date Resolved**: YYYY-MM-DD HH:MM UTC (or "Ongoing")  
**Severity**: Critical | High | Medium | Low  
**Status**: Detected | Investigating | Contained | Resolved | Closed

---

## Executive Summary

<!-- One paragraph summary of what happened, impact, and resolution -->

---

## Timeline

| Time (UTC) | Event | Action Taken | Person/Team |
|------------|-------|--------------|-------------|
| HH:MM | Initial detection | Alert triggered | Monitoring System |
| HH:MM | Investigation started | Team notified | Security Team |
| HH:MM | Issue identified | Root cause found | Lead Engineer |
| HH:MM | Containment | EMERGENCY_LOCKDOWN enabled | On-call Engineer |
| HH:MM | Resolution deployed | Patch released | DevOps Team |
| HH:MM | Monitoring | Validation of fix | Security Team |
| HH:MM | Incident closed | Postmortem completed | Incident Commander |

---

## Incident Details

### What Happened

<!-- Detailed description of the incident -->

### Root Cause

<!-- Technical explanation of what caused the incident -->

### Impact Assessment

**Systems Affected:**
- List affected systems, services, or components

**Data Affected:**
- List any data that was exposed, modified, or lost
- Include number of users/records affected

**User Impact:**
- Describe how users were affected
- Include number of affected users

**Business Impact:**
- Service downtime duration
- Financial impact (if applicable)
- Reputational impact

### Attack Vector (if security breach)

<!-- How did the attacker gain access? What vulnerabilities were exploited? -->

---

## Response Actions

### Immediate Actions (Contain)

1. **Action**: Set `EMERGENCY_LOCKDOWN=true`
   - **Result**: All agent actions disabled
   - **Time**: HH:MM UTC

2. **Action**: Isolated affected systems
   - **Result**: Systems removed from production
   - **Time**: HH:MM UTC

### Short-term Actions (Rotate/Revoke)

1. **Action**: Rotated all signing keys
   - **Command**: `npm run rotate-keys --emergency`
   - **Time**: HH:MM UTC

2. **Action**: Revoked compromised tokens
   - **API Call**: `/api/v1/admin/revoke-all-tokens`
   - **Time**: HH:MM UTC

### Long-term Actions (Fix/Prevent)

1. **Action**: Deployed patch
   - **Version**: v1.2.3
   - **Time**: HH:MM UTC

2. **Action**: Updated security policies
   - **Changes**: Listed below
   - **Time**: HH:MM UTC

---

## Technical Details

### Logs

```
# Include relevant log entries (redacted for PII)
```

### Code Changes

<!-- Link to PR or commit that fixed the issue -->
- PR: #XXX
- Commit: abc123def456

### Configuration Changes

<!-- List any configuration or environment variable changes -->

---

## Notifications

### Internal Notifications

- [x] Security council notified
- [x] Engineering team notified
- [x] Executive team notified
- [x] Legal team notified (if applicable)

### External Notifications

- [ ] Affected users notified
- [ ] Partners notified
- [ ] Regulatory bodies notified (if required)
- [ ] Public disclosure (if required)

**Notification Content:**
<!-- Attach or summarize notification sent to users/partners -->

---

## Lessons Learned

### What Went Well

1. 
2. 
3. 

### What Could Be Improved

1. 
2. 
3. 

### Gaps Identified

1. **Gap**: Description of gap
   - **Impact**: How this gap contributed to incident
   - **Recommendation**: How to close this gap

---

## Action Items

| Action Item | Owner | Due Date | Status |
|-------------|-------|----------|--------|
| Update authentication logic | @engineer | YYYY-MM-DD | Open |
| Add monitoring alert | @devops | YYYY-MM-DD | In Progress |
| Update documentation | @tech-writer | YYYY-MM-DD | Completed |
| Conduct training | @security-lead | YYYY-MM-DD | Open |

---

## Prevention Measures

### Immediate (Deployed)

- [ ] Patch deployed to production
- [ ] New monitoring alerts configured
- [ ] Security controls strengthened

### Short-term (Within 2 weeks)

- [ ] Additional testing implemented
- [ ] Documentation updated
- [ ] Team training completed

### Long-term (Within 1 quarter)

- [ ] Architecture changes implemented
- [ ] Security audit conducted
- [ ] Compliance review completed

---

## Compliance and Regulatory

### Regulatory Requirements

- [ ] GDPR notification required? (If EU users affected)
- [ ] CCPA notification required? (If CA users affected)
- [ ] Other regulatory notifications required?

### Compliance Actions

<!-- List any compliance-related actions taken -->

---

## Cost Analysis

### Direct Costs

- Engineering time: X hours @ $Y/hour = $Z
- Cloud resources: $X
- External consultants: $X
- Legal fees: $X

### Indirect Costs

- Reputational damage: (Estimated)
- User churn: X users
- Lost revenue: $X

**Total Estimated Cost**: $X

---

## Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Incident Commander | | | |
| Security Lead | | | |
| Engineering Manager | | | |
| CTO/VP Engineering | | | |

---

## References

- Related incidents: INC-YYYY-MM-DD-XXX
- Related PRs: #XXX, #YYY
- External resources: [link]
- CVE numbers (if applicable): CVE-YYYY-XXXXX

---

**Report Prepared By**: [Name]  
**Report Date**: YYYY-MM-DD  
**Report Version**: 1.0  
**Next Review Date**: YYYY-MM-DD

---

**Contact**: security@mbtq.dev
