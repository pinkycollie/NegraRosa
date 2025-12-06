# NegraRosa Agent Documentation

## Overview

NegraRosa agents automate security verification, identity attestation, and partner integration workflows within the NegraRosa Inclusive Security Framework. The intended audience includes developers building integrations, operations teams managing deployments, and security reviewers auditing agent behavior. The trust model is **zero-custody**: agents never hold user credentials or private keys; all sensitive operations use short-lived cryptographic sessions with minimal scopes, and all agent actions are logged to an append-only audit store.

---

## Security Pillars Framework

Security in NegraRosa rests on immutable pillars applied across online, offline, repository, branch, and AI surfaces with clear governance and automation:

| **Pillar** | **Primary Focus** | **Key Controls** | **Why it matters** |
|---|---|---|---|
| **Identity & Access** | Who can act | Paseto v4 public tokens, short TTL (15m sessions), MFA, RBAC | Prevents unauthorized actions and lateral movement |
| **Code & CI Hygiene** | What runs | Pinned deps, SCA (npm audit), spectral OpenAPI checks, import-ban for DB in `/api`, gated deploys | Stops vulnerable code from shipping and prevents backdoors |
| **Data Minimization & Redaction** | What is stored/shared | Redaction middleware, `PERSISTENCE=false` default, CI tests that fail on PII leaks | Limits blast radius of breaches and regulatory exposure |
| **Infrastructure & Network** | How it's exposed | Domain separation (api.negrarosa.* vs docs.*), WAF rules, rate limits (100 req/min/IP), pinned runtimes | Keeps bots and exploits from breaking APIs |
| **Supply-chain & Dependency** | What we depend on | CVE monitoring, rapid backports, reproducible builds, SBOM generation | Prevents compromised dependencies from infiltrating the codebase |
| **Observability & Response** | What we detect | `/health`, `/metrics` endpoints, anomaly alerts, signed audit trails, incident playbook | Enables rapid detection and containment of incidents |
| **AI & Model Safety** | Model inputs/outputs | Prompt logging (redacted), model input/output validation, data-use policy enforcement | Prevents data leakage through AI systems and misuse |

### Case Study: Framework Security (Next.js Middleware CVE-2025-29927)

Recent critical vulnerabilities in framework middleware (like the Next.js CVE-2025-29927 bypass) demonstrate that **framework internals cannot be trusted as auth boundaries**. The exploit abused internal headers to bypass recursive middleware checks. **Lessons learned:**

1. Always validate middleware behavior in CI and runtime monitoring
2. Implement defense-in-depth: don't rely solely on framework auth
3. Subscribe to vendor advisories and patch rapidly
4. Practice coordinated disclosure and have an incident response plan

**NegraRosa mitigation**: We pin framework versions, run spectral checks on all API routes, and enforce explicit auth validation at every endpoint—never trusting middleware alone.

---

## Purpose and Scope

### One-line description
**NegraRosa Agents**: Automated systems that handle identity verification, partner integration workflows, security attestation, and audit logging within the NegraRosa Inclusive Security Framework.

### Scope
- **Repos**: `pinkycollie/NegraRosa` (main codebase), with read-only access to `pinkycollie/NegraRosa-contracts` for smart contract verification
- **Branches**: Agents may only push to feature branches matching `agent/*` or `copilot/*` patterns; all merges to `main` require human approval from security council
- **Environments**: `development`, `staging`, and `production`; agents have elevated permissions only in `staging` for testing

### Explicit non-goals
- Agents **never** write secrets to the repository
- Agents **never** enable infrastructure provisioning (e.g., creating cloud resources)
- Agents **never** access production databases directly; all access is via API with audit logging
- Agents **never** merge PRs without human security council approval

---

## Capabilities and Limits

### Machine-readable capabilities

| **Capability** | **Max Rate** | **Allowed Repos** | **Description** |
|---|---|---|---|
| `create-pr` | 10/hour | `pinkycollie/NegraRosa` | Open PRs with clear title, checklist, and `agent: true` label |
| `run-spectral` | 100/hour | `pinkycollie/NegraRosa` | Run Spectral OpenAPI linting on API specs |
| `deploy-preview` | 5/hour | `pinkycollie/NegraRosa` | Deploy preview environments for PR review |
| `submit-attestation` | 50/hour | `pinkycollie/NegraRosa` | Submit identity verification attestations |
| `run-sca` | 20/hour | `pinkycollie/NegraRosa` | Execute npm audit and dependency vulnerability scans |
| `redact-pii` | 1000/hour | `pinkycollie/NegraRosa` | Apply PII redaction middleware to API responses |
| `rotate-webhook-secret` | 1/day | `pinkycollie/NegraRosa` | Rotate webhook HMAC secrets via KMS |

### Human-readable constraints

Agents are designed with **least privilege** and **fail-safe** principles:

- **Never** store PII in logs or persistent storage without explicit user consent
- **Never** expose user wallet private keys or session tokens in logs
- **Never** bypass rate limits or security controls
- **Never** retry destructive actions (e.g., DB writes) on failure; instead, open an incident ticket
- **Always** use `PERSISTENCE=false` in development and test environments
- **Always** redact sensitive data (SSN, API keys, wallet addresses) in responses via middleware

---

## Authentication and Secrets

### Authentication scheme

- **Session tokens**: Paseto v4 public tokens with 15-minute TTL, signed with Ed25519 keys
- **Webhook HMAC**: SHA-256 HMAC with single-use nonces and 5-minute expiry
- **API keys for partners**: Format `ngrs_{user_nft_id}_{partner_id}_{permission_hash}`, stored in KMS, rotated quarterly

### Token structure (Paseto example)

```json
{
  "iss": "fibonroseid",
  "aud": "negrarosa",
  "cap": ["attest:submit", "verification:read"],
  "sid": "s_abc123xyz",
  "exp": 1710000000,
  "sub": "user:IAM#25798"
}
```

**Header**: `Authorization: Bearer v4.public.<token>`

### Where secrets live

- **KMS/HSM only**: All secrets (signing keys, API keys, DB credentials) stored in AWS KMS or equivalent HSM
- **No secrets in repo**: `.env` files are gitignored; sample `.env.example` provided without real values
- **Rotation cadence**: 
  - Session signing keys: rotated monthly
  - Webhook HMAC secrets: rotated weekly
  - Partner API keys: rotated quarterly or on partner request

### How to revoke credentials

1. **Immediate revocation**: Call `/api/v1/admin/revoke-token` with token ID and reason
2. **Key rotation**: Run `npm run rotate-keys` (requires admin MFA)
3. **Emergency kill switch**: Set `EMERGENCY_LOCKDOWN=true` in environment to disable all agent actions
4. **Notify**: Send incident report to **security@mbtq.dev** with revocation details

---

## API Surface and Schemas

### Endpoints exposed by agents

| **Endpoint** | **Method** | **Purpose** | **Auth Required** |
|---|---|---|---|
| `/api/v1/agents/health` | GET | Health check for agent services | None (public) |
| `/api/v1/agents/metrics` | GET | Prometheus-compatible metrics | API key (ops team) |
| `/api/v1/agents/attestations` | POST | Submit identity verification attestation | Paseto session token |
| `/api/v1/agents/webhooks/partner` | POST | Receive webhook from partner integration | HMAC signature |
| `/api/v1/agents/audit` | GET | Retrieve audit logs for agent actions | Admin API key + MFA |

### JSON Schema references

All request/response schemas are defined in `shared/schemas/` and validated using Zod:

- **Attestation submission**: `shared/schemas/attestation.schema.ts`
- **Webhook payload**: `shared/schemas/webhook.schema.ts`
- **Audit log entry**: `shared/schemas/audit.schema.ts`

### Example request: Submit attestation

```bash
curl -X POST https://api.negrarosa.mbtq.dev/api/v1/agents/attestations \
  -H "Authorization: Bearer v4.public.eyJpc3MiOi..." \
  -H "Content-Type: application/json" \
  -d '{
    "user_nft_id": "IAM#25798",
    "verification_type": "identity",
    "attestation_data": {
      "name_verified": true,
      "address_verified": true,
      "verification_level": 3
    },
    "attester_id": "agent_civic_01"
  }'
```

**Response** (200 OK):
```json
{
  "attestation_id": "att_xyz789",
  "status": "submitted",
  "timestamp": "2025-12-06T22:45:00Z",
  "audit_log_id": "audit_abc123"
}
```

---

## Events and Webhooks

### Emitted events

Agents emit the following events to the event bus (implemented via WebSocket or webhook):

| **Event Name** | **Payload Schema** | **Delivery Guarantee** |
|---|---|---|
| `agent.attestation.submitted` | `AttestationSubmittedEvent` | At-least-once (with idempotency key) |
| `agent.pr.created` | `PRCreatedEvent` | Best-effort (non-critical) |
| `agent.security.alert` | `SecurityAlertEvent` | Exactly-once (critical path) |
| `agent.token.revoked` | `TokenRevokedEvent` | At-least-once (critical) |

### Webhook security

- **HMAC algorithm**: SHA-256
- **Token format**: `hmac-sha256=<hex_digest>`
- **Header**: `X-NegraRosa-Signature`
- **Nonce**: Single-use, stored in Redis with 5-minute TTL
- **Replay protection**: Requests with duplicate nonce or timestamp >5 minutes old are rejected

**Verification pseudocode**:
```javascript
const valid = verifyWebhookToken(NODE_HMAC_SECRET, url, nonce, expTs, token);
if (!valid) return res.status(401).json({ error: "Invalid signature" });
```

### Retry policy

- **Backoff**: Exponential backoff starting at 2 seconds, max 5 retries
- **Max attempts**: 5 attempts over 30 minutes
- **Dead-letter handling**: Failed events are logged to DLQ and generate alerts to operations team

---

## Security and Data Handling

### PII policy

**Definition of PII**: Any data that can identify an individual, including but not limited to:
- Full name, email address, phone number
- Government IDs (SSN, passport, driver's license)
- Wallet addresses (when linked to identity)
- Biometric data (facial templates, fingerprints)

**Redaction rules**:
1. **API responses**: All PII is redacted in logs and non-essential API responses via middleware
2. **Audit logs**: PII is encrypted at rest and only decrypted for authorized security reviews
3. **Testing**: Use synthetic PII (e.g., `test_user_123@example.com`) in all test environments

**Default**: `PERSISTENCE=false` in development and staging; all data is ephemeral unless explicitly configured otherwise.

### Persistence rules

- **Allowed DB writes**: Only to audit tables (`agent_actions`, `audit_logs`) and user-consented verification records
- **Encryption at rest**: AES-256 for all DB fields containing PII
- **Audit logging**: Every write includes `agent_id`, `request_id`, `user_id`, `timestamp`, and `action_type`

### CI gates (enforced in all PRs)

1. **Static import ban**: Fail build if any file in `/api/*` imports DB clients (e.g., `drizzle`, `pg`) directly
2. **Spectral OpenAPI check**: Fail if OpenAPI spec has security vulnerabilities or missing auth
3. **SCA (npm audit)**: Fail on high/critical CVEs unless explicitly suppressed with justification
4. **PII output tests**: Automated tests check that API responses don't leak SSN, API keys, or wallet addresses

**Example CI check** (`.github/workflows/security-hardening.yml`):
```yaml
- name: Check for banned imports
  run: |
    ! grep -r "import.*drizzle" ./api/ || exit 1
    ! grep -r "import.*pg" ./api/ || exit 1
```

### Runtime guards

- **Redaction middleware**: Applied to all Express routes; checks response bodies for patterns matching PII
- **Response content-type check**: All API responses must be `application/json`; HTML responses trigger alerts (potential XSS)
- **Rate limiting**: 100 requests/minute per IP address; 1000 requests/hour per API key

---

## CI, Testing, and PR Workflow

### Local development

- **Environment toggles**: Set `NODE_ENV=development` and `PERSISTENCE=false` in `.env`
- **Sample docker-compose**: `docker-compose.dev.yml` includes Postgres, Redis, and mock partner APIs
- **Run locally**:
  ```bash
  npm install
  npm run dev
  # Server starts at http://localhost:5000
  ```

### Tests

- **Unit tests**: Jest tests for all service classes (`server/services/*.test.ts`)
- **Integration tests**: Test API endpoints with supertest and Hardhat testnet for smart contract interactions
- **Spectral tests**: Run `npm run spectral` to lint OpenAPI specs in `docs/openapi/`
- **PII tests**: Automated tests in `tests/security/pii.test.ts` assert no PII in responses

**Run tests**:
```bash
npm test                  # All tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests
npm run spectral          # OpenAPI linting
```

### PR template checklist

When agents open PRs (or when humans open PRs affecting agent code), include:

```markdown
## Agent PR Checklist

- [ ] Spectral OpenAPI checks passed (`npm run spectral`)
- [ ] No DB imports in `/api/*` (import ban enforced)
- [ ] PII output tests passed (`npm run test:pii`)
- [ ] SCA (npm audit) has no high/critical CVEs
- [ ] `SECURITY.md` is present and up-to-date
- [ ] Agent code has corresponding unit tests
- [ ] Audit logging is implemented for all agent actions
- [ ] Secrets are stored in KMS (not in repo or env files)
- [ ] Preview deployment tested and verified
- [ ] security@mbtq.dev notified if introducing new capabilities
```

### Auto-PRs by agents

- **Bot identity**: Dedicated GitHub App `@negrarosa-agent-bot` with `CODEOWNERS` configured
- **Required reviewers**: At least one member of security council (`@security-council`)
- **Auto-merge**: Disabled for agent PRs; all require human approval
- **Fail-safe**: If CI fails, agent opens an incident ticket and does **not** retry

---

## Observability and Runbook

### Health endpoints

- **`/health`**: Returns `200 OK` if all services (DB, Redis, KMS) are reachable
  ```json
  { "status": "healthy", "services": { "db": "ok", "redis": "ok", "kms": "ok" } }
  ```
- **`/metrics`**: Prometheus-compatible metrics including:
  - `agent_actions_total` (counter by action type)
  - `agent_request_duration_seconds` (histogram)
  - `agent_errors_total` (counter by error type)

### Alerts

Set up alerts (via Datadog, PagerDuty, or equivalent) for:

- **Token misuse**: More than 10 failed auth attempts in 1 minute from single IP
- **Failed webhook deliveries**: More than 3 consecutive failures to same endpoint
- **CI failures**: Any agent PR fails required checks
- **PII leakage**: Runtime detection of PII patterns in API responses (triggers immediate incident)

### Incident steps

**Contain → Rotate → Revoke → Notify → Document**

1. **Contain**: Set `EMERGENCY_LOCKDOWN=true` to disable all agent actions
2. **Rotate keys**: Run `npm run rotate-keys --emergency` to rotate all signing keys
3. **Revoke tokens**: Call `/api/v1/admin/revoke-all-tokens` with MFA
4. **Notify**: Email **security@mbtq.dev** with incident details and impact assessment
5. **Document**: Create postmortem in `docs/incidents/<date>-<brief-desc>.md`

**Incident template**: See `docs/templates/incident-template.md`

---

## Governance and Approvals

### Who approves agent changes

- **Code changes**: Requires approval from at least one `@security-council` member
- **Capability additions**: Requires unanimous approval from security council
- **Secret rotation**: Automated monthly; emergency rotation requires `@security-council` notification

### Release policy

- **Feature flags**: New capabilities are behind feature flags (e.g., `ENABLE_NEW_VERIFICATION=false`)
- **Staged rollout**: 
  1. Deploy to `staging` for 48 hours
  2. Deploy to `production` canary (10% traffic) for 24 hours
  3. Full rollout to 100% if no incidents
- **Preview cleanup**: All preview deployments are auto-deleted after PR merge or 7 days

### Audit cadence

- **Monthly repo scan**: Automated scan for missing `SECURITY.md`, unapproved imports, and exposed secrets
- **Quarterly security review**: Manual review of agent code by external security auditor
- **Annual penetration test**: Full pentest of agent APIs and infrastructure

---

## Examples and Templates

### PR template snippet

```markdown
## Changes
- Brief description of what this PR does

## Agent Checklist
- [ ] spectral passed
- [ ] no DB imports in /api
- [ ] PII output tests passed
- [ ] security@mbtq.dev notified if needed

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed in preview env
```

### Webhook HMAC verification (Node.js)

```javascript
import crypto from 'crypto';

function verifyWebhookToken(secret, url, nonce, expTs, providedToken) {
  const now = Date.now() / 1000;
  if (now > expTs) return false; // Expired
  
  // Check nonce uniqueness (Redis lookup)
  if (await redis.exists(`nonce:${nonce}`)) return false; // Replay
  
  const payload = `${url}|${nonce}|${expTs}`;
  const expectedToken = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  const valid = crypto.timingSafeEqual(
    Buffer.from(expectedToken),
    Buffer.from(providedToken)
  );
  
  if (valid) {
    await redis.setex(`nonce:${nonce}`, 300, '1'); // Store for 5 min
  }
  
  return valid;
}
```

### Paseto token claims (example)

```json
{
  "iss": "fibonroseid",
  "aud": "negrarosa",
  "cap": ["attest:submit"],
  "sid": "s_abc123xyz",
  "exp": 1710000000,
  "sub": "user:IAM#25798",
  "jti": "token_unique_id_789"
}
```

**Note**: Never log the full token or signing key; only log `jti` (token ID) for audit trails.

---

## Practical Security Roadmap

This roadmap provides actionable steps to operationalize the security pillars:

### Immediate (days)

- [ ] Pin runtime versions in `package.json` (exact versions, not `^` or `~`)
- [ ] Run `npm audit` and address high/critical CVEs
- [ ] Add Spectral OpenAPI checks to CI workflow
- [ ] Enforce import-ban for DB clients in `/api/*` (grep check in CI)
- [ ] Enable preview cleanup (auto-delete after 7 days or PR merge)
- [ ] Set up budget alerts for Vercel/cloud provider

### Short-term (weeks)

- [ ] Deploy redaction middleware for all API routes
- [ ] Migrate to Paseto v4 public tokens with 15-minute TTL
- [ ] Implement HMAC single-use webhooks with nonce tracking
- [ ] Add CI tests that assert `content-type: application/json` for all API responses
- [ ] Create `SECURITY.md` with contact **security@mbtq.dev**
- [ ] Set up monitoring alerts for token misuse and failed webhooks

### Medium-term (months)

- [ ] Implement event signing with Ed25519 for audit logs
- [ ] Automate key rotation (monthly for session keys, quarterly for partner keys)
- [ ] Generate SBOM (Software Bill of Materials) for all dependencies
- [ ] Conduct first incident response drill with security council
- [ ] Set up supply-chain attestations (e.g., SLSA provenance)

### Ongoing

- [ ] Subscribe to vendor security advisories (Node.js, Vercel, npm)
- [ ] Run weekly dependency scans (`npm audit`, Snyk, or Dependabot)
- [ ] Maintain canonical `SECURITY.md` with single contact
- [ ] Quarterly security reviews with external auditor
- [ ] Monthly repo scan for compliance (SECURITY.md, import bans, exposed secrets)

---

## Final Note: Security as a Culture

**Security is layered and social as much as technical.** Automate the boring checks (SCA, import bans, PII tests), make safe defaults the norm (`PERSISTENCE=false`, short-lived tokens, redaction middleware), and practice coordinated disclosure and incident drills. This combination of automation, safe defaults, and preparedness reduces risk far more than any single control.

**Key principles to internalize**:
- **Fail closed**: When in doubt, deny access and log the attempt
- **Defense in depth**: Never rely on a single security control
- **Assume breach**: Design systems to limit blast radius when (not if) a breach occurs
- **Continuous improvement**: Security is a journey, not a destination

For questions, security concerns, or incident reports, contact **security@mbtq.dev**.

---

## Rollout and Adoption Checklist

1. **Create agents.md** ✅ (this document) and add to CODEOWNERS
2. **Add CI checks** that enforce agents.md policy items (import-ban, spectral, SCA)
3. **Register agent identity** as GitHub App `@negrarosa-agent-bot` and document scopes
4. **Run 1-week audit** to detect endpoints returning HTML or storing PII
5. **Train teams** with 30-minute walkthrough of agents.md and PR checklist

---

**Document version**: 1.0.0  
**Last updated**: 2025-12-06  
**Maintained by**: Security Council (@security-council)  
**Contact**: security@mbtq.dev
