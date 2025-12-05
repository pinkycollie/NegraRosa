# PASETO Authentication Foundation

This document describes the PASETO (Platform-Agnostic Security Tokens) implementation in NegraRosa, which provides the authentication foundation for DeafAuth, PinkSync, and Fibonorse.

## Overview

NegraRosa implements PASETO v4 tokens following the [PASETO specification](https://github.com/paseto-standard/paseto-spec/tree/master/docs/02-Implementation-Guide). This provides a more secure alternative to JWT with stateless token management.

### PASETO v4 Features

- **v4.local**: Symmetric authenticated encryption using XChaCha20-Poly1305
- **v4.public**: Asymmetric digital signatures using Ed25519

## Token Types

### Local Tokens (v4.local)
Used for internal API authentication where both parties share a secret key.

```
v4.local.eyJkYXRhIjoiaW50ZXJuYWwifQ==.signature
```

### Public Tokens (v4.public)
Used for tokens that need to be verified by external parties without sharing secrets.

```
v4.public.eyJkYXRhIjoiZXh0ZXJuYWwifQ==.signature
```

## Services

### 1. DeafAuth (github.com/deafauth/deafauth)

DeafAuth is an accessibility-first authentication system designed for deaf and hard-of-hearing users.

#### Features
- Visual-based authentication challenges
- Sign language verification support
- Pattern, gesture, color sequence, and symbol match challenges
- Accessibility preference management
- PASETO token-based sessions

#### API Endpoints

```http
POST /api/v1/paseto/deafauth/authenticate
POST /api/v1/paseto/deafauth/challenge/visual
POST /api/v1/paseto/deafauth/challenge/verify
GET  /api/v1/paseto/deafauth/profile/:userId
PATCH /api/v1/paseto/deafauth/profile/:userId
POST /api/v1/paseto/deafauth/verify-token
```

#### Example: Visual Challenge Authentication

```javascript
// Create a visual challenge
const challenge = await fetch('/api/v1/paseto/deafauth/challenge/visual', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 123,
    type: 'pattern' // or 'gesture', 'color_sequence', 'symbol_match'
  })
});

// Verify the challenge response
const verification = await fetch('/api/v1/paseto/deafauth/challenge/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    challengeId: challenge.challenge.id,
    response: userPatternResponse
  })
});
```

### 2. PinkSync

PinkSync provides secure cross-platform data synchronization using PASETO tokens.

#### Features
- Session-based sync management
- Conflict detection and resolution
- Data encryption for sensitive fields
- Real-time sync status tracking
- Checksum verification for data integrity

#### API Endpoints

```http
POST /api/v1/paseto/pinksync/session
POST /api/v1/paseto/pinksync/sync/start
POST /api/v1/paseto/pinksync/sync/process
POST /api/v1/paseto/pinksync/conflict/resolve
GET  /api/v1/paseto/pinksync/session/:sessionId/status
DELETE /api/v1/paseto/pinksync/session/:sessionId
POST /api/v1/paseto/pinksync/verify-token
```

#### Example: Sync Session

```javascript
// Initialize sync session
const session = await fetch('/api/v1/paseto/pinksync/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 123,
    deviceId: 'device-uuid',
    platform: 'web',
    metadata: { appVersion: '1.0.0' }
  })
});

// Start sync operation
const operation = await fetch('/api/v1/paseto/pinksync/sync/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: session.session.id,
    type: 'push',
    dataType: 'user_preferences'
  })
});
```

### 3. Fibonorse

Fibonorse is a Norse mythology-inspired authentication framework using Fibonacci-based security patterns.

#### Features
- 9 trust realms (Helheim → Asgard)
- Rune-based visual authentication
- Fibonacci sequence challenges
- Verification oaths
- Progressive trust building

#### API Endpoints

```http
POST /api/v1/paseto/fibonorse/authenticate
POST /api/v1/paseto/fibonorse/challenge/rune
POST /api/v1/paseto/fibonorse/challenge/fibonacci
POST /api/v1/paseto/fibonorse/oath
POST /api/v1/paseto/fibonorse/ascend
POST /api/v1/paseto/fibonorse/rune/bind
GET  /api/v1/paseto/fibonorse/runes
GET  /api/v1/paseto/fibonorse/profile/:userId
POST /api/v1/paseto/fibonorse/verify-token
```

#### Trust Realms

| Realm | Level | Description |
|-------|-------|-------------|
| Helheim | 1 | Lowest trust - new/unverified |
| Niflheim | 2 | Minimal verification |
| Muspelheim | 3 | Basic verification |
| Jotunheim | 4 | Standard verification |
| Vanaheim | 5 | Enhanced verification |
| Alfheim | 6 | High verification |
| Svartalfheim | 7 | Advanced verification |
| Midgard | 8 | Full verification |
| Asgard | 9 | Maximum trust |

#### Example: Ascension

```javascript
// Create a verification oath
const oath = await fetch('/api/v1/paseto/fibonorse/oath', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 123,
    oathType: 'identity',
    statement: 'I solemnly affirm my identity as presented'
  })
});

// Attempt ascension to higher realm
const ascension = await fetch('/api/v1/paseto/fibonorse/ascend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 123 })
});
```

## Common Endpoints

### Get Public Key

Retrieve the current public key for external token verification.

```http
GET /api/v1/paseto/public-key
```

Response:
```json
{
  "success": true,
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...",
  "keyId": "abc123",
  "algorithm": "Ed25519",
  "version": "v4"
}
```

### Verify Token

Verify any PASETO token (auto-detects type).

```http
POST /api/v1/paseto/verify
```

Request:
```json
{
  "token": "v4.public.eyJkYXRhIjoiZXh0ZXJuYWwifQ==.signature"
}
```

### Get Configuration

```http
GET /api/v1/paseto/config
```

Response:
```json
{
  "success": true,
  "issuer": "negrarosa",
  "audience": "negrarosa-api",
  "version": "v4",
  "supportedPurposes": ["local", "public"]
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PASETO_ISSUER` | Token issuer identifier | `negrarosa` |
| `PASETO_AUDIENCE` | Token audience identifier | `negrarosa-api` |
| `PASETO_LOCAL_KEY` | Base64-encoded 32-byte key for local tokens | Auto-generated |

## Security Considerations

1. **Key Rotation**: Keys should be rotated regularly (default: 30 days)
2. **Token Expiry**: Access tokens expire in 1 hour, refresh tokens in 7 days
3. **Secure Storage**: Store PASETO_LOCAL_KEY securely in environment variables
4. **HTTPS Only**: Always use HTTPS in production
5. **Rate Limiting**: Implement rate limiting on authentication endpoints

## Integration with Existing Auth

The PASETO service works alongside the existing AuthService and can be used in conjunction with:

- Biometric authentication
- NFT authentication
- Recovery code authentication
- OAuth providers (Civic, Auth0)

## References

- [PASETO Specification](https://github.com/paseto-standard/paseto-spec)
- [PASETO v4 Implementation Guide](https://github.com/paseto-standard/paseto-spec/blob/master/docs/02-Implementation-Guide/01-Protocol-Overview.md)
- [DeafAuth Project](https://github.com/deafauth/deafauth)
