# MBTQ Platform Architecture

## Overview

NegraRosa is the secured services framework that powers the MBTQ ecosystem - a Deaf-first platform for inclusive development, vocational rehabilitation, and creative services.

## Ecosystem Structure

```
mbtq.dev (Parent Platform)
├── api.mbtq.dev           → NegraRosa Backend (THIS REPO)
│   ├── DeafAUTH           → Visual-first authentication
│   ├── FibonRose Trust    → Fibonacci-based security
│   ├── Visual Protocol    → IDEA→BUILD→GROW→MANAGED
│   └── HTTPS Proxy        → Multi-repo sync
│
├── pinksync.io            → Offline/Online Sync
│   ├── Device sync
│   ├── Attestation sync
│   └── Accessibility preferences
│
├── 360magicians.com       → AI Pathway Magicians
│   ├── Job Magician       → Career development
│   ├── Business Magician  → Automation (Taskade)
│   ├── Developer Magician → Code generation
│   └── Creative Magician  → VR design
│
├── vr4deaf.org            → VR Vocational Rehabilitation
│   ├── State VR compliance
│   ├── Client management
│   └── Progress reporting
│
└── github.com/pinkflow    → Sign Language Model CI/CD
    ├── Model validation
    ├── Accessibility testing
    └── Deployment pipeline
```

## HTTP/HTTPS Dispatch Logic

### Internal Services (HTTP - localhost only)
```
┌─────────────────────────────────────────────────────────────┐
│                    Internal Network (HTTP)                   │
│                                                             │
│  nginx (127.0.0.1)  ──────►  NegraRosa (127.0.0.1:5000)    │
│                              ├── /api/v1/deafauth           │
│                              ├── /api/v1/fibonacci          │
│                              ├── /api/v1/pinksync           │
│                              ├── /api/v1/ai                 │
│                              ├── /api/v1/vr                 │
│                              ├── /api/v1/visual             │
│                              ├── /api/v1/video              │
│                              ├── /api/v1/automl             │
│                              └── /api/v1/proxy              │
└─────────────────────────────────────────────────────────────┘
```

### External Services (HTTPS - SSL/TLS)
```
┌─────────────────────────────────────────────────────────────┐
│                    External Network (HTTPS)                  │
│                                                             │
│  Internet ──► nginx (443) ──► SSL Termination               │
│               ├── mbtq.dev           (TLS 1.2+)             │
│               ├── api.mbtq.dev       (TLS 1.2+)             │
│               ├── pinksync.io        (TLS 1.2+)             │
│               ├── 360magicians.com   (TLS 1.2+)             │
│               └── vr4deaf.org        (TLS 1.3 only)         │
│                                                             │
│  HTTP (80) ──► Redirect to HTTPS (301)                      │
└─────────────────────────────────────────────────────────────┘
```

## Service Classification

### Core Services (NegraRosa)
| Service | Purpose | Rate Limit |
|---------|---------|------------|
| DeafAUTH | Visual-first authentication | 5 req/s |
| FibonRose Trust | Fibonacci security metrics | 10 req/s |
| PinkSync | Offline/online synchronization | 10 req/s |
| Fibonacci Security | GENERATIVE UNITS protection | 10 req/s |

### AI Services (360Magicians)
| Service | Purpose | Rate Limit |
|---------|---------|------------|
| AI Proxy | Pathway Magicians router | 2 req/s |
| AutoML | Code generation/review | 2 req/s |
| Visual Protocol | Client/Server lifecycle | 10 req/s |
| Video Processing | FFmpeg + captions | 5 req/s |

### Compliance Services (VR4Deaf)
| Service | Purpose | Rate Limit |
|---------|---------|------------|
| VR Compliance | State VR regulations | 5 req/s |
| Case Management | Client tracking | 10 req/s |
| Progress Reporting | IPE tracking | 5 req/s |

## Fibonacci-Based Resource Limits

All resource limits follow Fibonacci sequence for natural scaling:

| Resource | Limit | Fibonacci |
|----------|-------|-----------|
| Cache size | 377 items | F(14) |
| Cache TTL | 55-610 seconds | F(10)-F(15) |
| Max sockets | 34 | F(9) |
| Queue size | 89 items | F(11) |
| Upload size | 233 MB | F(13) |
| Timeout | 55 seconds | F(10) |

## Visual Protocol Lifecycle

### Client-Facing (Business Lifecycle)
```
IDEA → BUILD → GROW → MANAGED
  │       │       │       │
  │       │       │       └── Ongoing support
  │       │       └── Scale operations
  │       └── Development
  └── Consultation
```

### Server-Facing (Technical Lifecycle)
```
BUILD → SERVE → EVENT
  │       │       │
  │       │       └── WebSocket/Real-time
  │       └── API responses
  └── Application build
```

## Security Layers

1. **Transport Security**
   - TLS 1.2+ for all public endpoints
   - TLS 1.3 required for VR compliance
   - HTTP → HTTPS redirect (301)

2. **Authentication**
   - DeafAUTH (visual patterns, QR, biometric)
   - HTTP Basic Auth (admin routes)
   - CORS configured for ecosystem domains

3. **Rate Limiting**
   - Per-IP limits (nginx)
   - Per-endpoint limits
   - Fibonacci burst limits

4. **Caching**
   - Proxy cache (233 MB)
   - Response caching (API)
   - Static file caching (1 year)

## Deployment Targets

| Environment | Runner | Purpose |
|-------------|--------|---------|
| GitHub Actions | ubuntu-latest | CI/CD |
| Self-Hosted | mbtq-ubuntu | Production deploy |
| Docker | Local | Development |

## Related Repositories

- [NegraRosa](https://github.com/pinkycollie/NegraRosa) - Backend services
- [mbtq.dev](https://github.com/pinkycollie/mbtq.dev) - Parent platform
- [pinksync](https://github.com/pinkycollie/pinksync) - Sync service
- [360magicians](https://github.com/pinkycollie/360magicians) - AI platform
- [vr4deaf](https://github.com/pinkycollie/vr4deaf) - VR portal
- [pinkflow](https://github.com/pinkflow) - Sign language ML CI/CD
- [fibonroseTrust](https://github.com/fibonroseTrust) - Security metrics
- [deafauth](https://github.com/pinkycollie/deafauth) - Authentication
- [mbtquniverse](https://github.com/pinkycollie/mbtquniverse) - Community
