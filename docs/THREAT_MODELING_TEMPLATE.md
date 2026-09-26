# Threat Modeling Template

Use this template for quarterly threat modeling sessions or when designing major new features.

## Session Information

**Date:** YYYY-MM-DD  
**Feature/Component:** [Name of feature being analyzed]  
**Participants:** [List team members involved]  
**Facilitator:** [Lead the session]

---

## 1. What Are We Building?

### Feature Description
[Provide a clear description of the feature or system being analyzed]

### Architecture Overview
[Include diagrams, data flows, or architectural descriptions]

```
Example:
┌──────────┐      ┌──────────┐      ┌──────────┐
│  Client  │─────▶│   API    │─────▶│ Database │
└──────────┘      └──────────┘      └──────────┘
```

### Data Flow
[Describe how data moves through the system]

1. User input → 
2. Validation → 
3. Processing → 
4. Storage → 
5. Response →

### Trust Boundaries
[Identify where data crosses trust boundaries]

- External users → Application
- Application → Database
- Application → Third-party services

---

## 2. What Can Go Wrong?

Use the STRIDE model to identify threats:

### S - Spoofing (Authentication)
**Threat:** Can an attacker impersonate a user or system component?

| ID | Threat Description | Affected Component | Likelihood | Impact |
|----|-------------------|-------------------|------------|--------|
| S1 | | | Low/Med/High | Low/Med/High |

### T - Tampering (Integrity)
**Threat:** Can an attacker modify data or code?

| ID | Threat Description | Affected Component | Likelihood | Impact |
|----|-------------------|-------------------|------------|--------|
| T1 | | | Low/Med/High | Low/Med/High |

### R - Repudiation (Non-repudiation)
**Threat:** Can an attacker deny performing an action?

| ID | Threat Description | Affected Component | Likelihood | Impact |
|----|-------------------|-------------------|------------|--------|
| R1 | | | Low/Med/High | Low/Med/High |

### I - Information Disclosure (Confidentiality)
**Threat:** Can an attacker access sensitive information?

| ID | Threat Description | Affected Component | Likelihood | Impact |
|----|-------------------|-------------------|------------|--------|
| I1 | | | Low/Med/High | Low/Med/High |

### D - Denial of Service (Availability)
**Threat:** Can an attacker disrupt service availability?

| ID | Threat Description | Affected Component | Likelihood | Impact |
|----|-------------------|-------------------|------------|--------|
| D1 | | | Low/Med/High | Low/Med/High |

### E - Elevation of Privilege (Authorization)
**Threat:** Can an attacker gain unauthorized access?

| ID | Threat Description | Affected Component | Likelihood | Impact |
|----|-------------------|-------------------|------------|--------|
| E1 | | | Low/Med/High | Low/Med/High |

---

## 3. What Are We Doing to Defend It?

### Existing Controls
[List security controls already in place]

- Authentication: [e.g., JWT tokens, OAuth]
- Authorization: [e.g., RBAC, ACLs]
- Input Validation: [e.g., Zod schemas]
- Encryption: [e.g., TLS, at-rest encryption]
- Monitoring: [e.g., logging, alerting]

### Mitigations

For each threat identified, document the mitigation:

| Threat ID | Mitigation Strategy | Implementation Status | Owner | Priority |
|-----------|-------------------|----------------------|-------|----------|
| S1 | | Implemented/Planned/Not Started | | High/Med/Low |
| T1 | | Implemented/Planned/Not Started | | High/Med/Low |

### Residual Risks
[Document risks that cannot be fully mitigated]

| Risk | Justification | Acceptance |
|------|--------------|------------|
| | | Accepted by: [Name/Role] |

---

## 4. Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| | | | Open/In Progress/Done |

---

## 5. Review and Sign-off

**Review Date:** YYYY-MM-DD  
**Next Review:** YYYY-MM-DD (Quarterly or when significant changes occur)

**Approvals:**
- Security Lead: [Name] - [Date]
- Engineering Lead: [Name] - [Date]
- Product Owner: [Name] - [Date]

---

## Notes
[Any additional notes or considerations]

---

## Example Threat Model

### Feature: User Authentication System

#### What Are We Building?
A JWT-based authentication system for the NegraRosa platform.

#### Identified Threats:
- **S1:** Attacker could steal JWT tokens via XSS
  - **Mitigation:** Use HttpOnly cookies, implement CSP headers
  - **Status:** Implemented
  - **Priority:** High

- **T1:** Attacker could modify JWT payload
  - **Mitigation:** Use signed JWTs with strong secret key
  - **Status:** Implemented
  - **Priority:** High

- **I1:** Sensitive user data in JWT could be exposed
  - **Mitigation:** Minimize data in JWT, use short expiry, encrypt sensitive claims
  - **Status:** Planned
  - **Priority:** Medium
