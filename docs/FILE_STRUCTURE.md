# NegraRosa File Structure Documentation

This document provides a comprehensive guide to the NegraRosa repository file structure and organization.

## Table of Contents

- [Overview](#overview)
- [Root Directory](#root-directory)
- [Source Code](#source-code)
- [Configuration Files](#configuration-files)
- [Documentation](#documentation)
- [Assets](#assets)
- [CI/CD](#cicd)

---

## Overview

The NegraRosa repository follows a modular architecture with clear separation between frontend, backend, shared code, and configuration. This structure supports:

- **Scalability:** Easy to add new features and components
- **Maintainability:** Clear organization aids development
- **Deployment:** Optimized for GitHub Pages and cloud platforms
- **Security:** Isolated sensitive configurations

---

## Root Directory

```
NegraRosa/
├── .github/              # GitHub-specific configuration
├── Awesome-Hacking/      # Security resources (external)
├── api/                  # Legacy API endpoints
├── attached_assets/      # Static assets and documentation
├── client/               # Frontend application
├── docs/                 # Documentation
├── server/               # Backend application
├── shared/               # Shared utilities and types
├── .gitignore           # Git ignore patterns
├── .replit.archived     # Archived Replit config
├── .vercelignore        # Vercel ignore patterns
├── DEPLOY.md            # Deployment guide
├── README.md            # Main documentation
├── drizzle.config.ts    # Database ORM configuration
├── generated-icon.png   # Application icon
├── package.json         # Node.js dependencies
├── postcss.config.js    # PostCSS configuration
├── replit.nix.archived  # Archived Nix configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── test-scan-image.js   # Image scanning test
├── test-why-submissions.js  # Submissions test
├── theme.json           # Theme configuration
├── tsconfig.json        # TypeScript configuration
├── vercel.json          # Vercel configuration (legacy)
└── vite.config.ts       # Vite bundler configuration
```

### Key Root Files

| File | Purpose | Notes |
|------|---------|-------|
| `package.json` | Dependencies and scripts | Updated for GitHub Pages |
| `vite.config.ts` | Build configuration | Optimized, Replit plugins removed |
| `tsconfig.json` | TypeScript settings | Compiler options |
| `tailwind.config.ts` | Styling framework | Custom theme configuration |
| `.gitignore` | Version control exclusions | Enhanced for GitHub Pages |

---

## Source Code

### Frontend (`client/`)

The frontend is a React-based single-page application (SPA) built with TypeScript and Vite.

```
client/
├── public/
│   └── 404.html          # SPA routing handler for GitHub Pages
├── src/
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and helpers
│   ├── pages/           # Application pages
│   ├── styles/          # CSS files
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
└── index.html           # HTML template
```

#### Components (`client/src/components/`)

Organized by feature and functionality:

```
components/
├── accessibility/        # Accessibility features
│   ├── AccessibilityDemo.tsx
│   ├── LanguageSelector.tsx
│   ├── RealTimeTranslation.tsx
│   ├── VoiceGuidance.tsx
│   └── verification/
│       └── InclusivePhoneVerification.tsx
│
├── auth/                # Authentication components
│   ├── DeafFirstAuth.tsx
│   └── SignLanguageAuth.tsx
│
├── authentication/      # Verification UI
│   ├── AccessTiers.tsx
│   ├── VerificationMethods.tsx
│   └── VerificationProgress.tsx
│
├── badges/             # Achievement system
│   └── SecurityAchievementBadges.tsx
│
├── framework/          # Core framework
│   └── SecurityFramework.tsx
│
├── identity/           # Identity management
│   ├── BiometricAuth.tsx
│   ├── BiometricRecovery.tsx
│   ├── CompanyPerspectiveWidget.tsx
│   ├── CourtRecordsCorrection.tsx
│   ├── DataArchitectureExplainer.tsx
│   ├── DataSharingPolicy.tsx
│   ├── DataVisibilityControl.tsx
│   ├── ExplanationEditor.tsx
│   ├── FinancialHistoryVerification.tsx
│   ├── IdentityOverview.tsx
│   ├── ImmigrationDocumentation.tsx
│   ├── NFTIdentityCard.tsx
│   ├── NftAuth.tsx
│   └── ParentSupportVerification.tsx
│
├── reputation/         # Reputation system
│   └── ReputationBuildingCard.tsx
│
├── risk/              # Risk management
│   └── RiskManagementWidget.tsx
│
├── security/          # Security features
│   ├── InclusiveSecurityComparison.tsx
│   └── PartnershipIntegration.tsx
│
├── ui/                # UI component library (shadcn/ui)
│   ├── accordion.tsx
│   ├── alert-dialog.tsx
│   ├── alert.tsx
│   ├── [50+ UI components]
│   └── tooltip.tsx
│
├── verification/      # Verification dashboard
│   └── VerificationDashboard.tsx
│
└── [Utility Components]
    ├── AboutPlatform.tsx
    ├── AppFooter.tsx
    ├── AppHeader.tsx
    ├── DashboardTabs.tsx
    ├── EasterEggHints.tsx
    ├── GestureEasterEgg.tsx
    ├── MainframeLayout.tsx
    ├── PinkSyncWidget.tsx
    ├── ScrollToTop.tsx
    ├── SmoothScrollLink.tsx
    └── SupportBubble.tsx
```

#### Pages (`client/src/pages/`)

Application routes and page components:

```
pages/
├── AccessibilityPage.tsx     # Accessibility features showcase
├── Dashboard.tsx             # User dashboard
├── IndividualIdPage.tsx      # Individual identity management
├── MainframeDashboard.tsx    # Organization dashboard
├── PricingPage.tsx           # Pricing information
├── WebhookManagement.tsx     # Webhook configuration
└── not-found.tsx            # 404 error page
```

#### Hooks (`client/src/hooks/`)

Custom React hooks:

```
hooks/
├── use-mobile.tsx    # Mobile detection hook
└── use-toast.ts      # Toast notification hook
```

#### Library (`client/src/lib/`)

Utilities, helpers, and shared logic:

```
lib/
├── i18n/
│   ├── LanguageContext.tsx   # Internationalization context
│   └── translations.ts       # Translation strings
├── queryClient.ts            # TanStack Query client
├── types.ts                  # TypeScript type definitions
└── utils.ts                  # Utility functions
```

### Backend (`server/`)

Express-based Node.js backend with TypeScript:

```
server/
├── api/
│   ├── v1/                   # API version 1
│   │   ├── auth.ts          # Authentication endpoints
│   │   ├── fibonRoseTrust.ts # FibonRose trust system
│   │   ├── index.ts         # API entry point
│   │   ├── opensource/      # Open source integrations
│   │   │   └── index.ts
│   │   ├── partners/        # Partner integrations
│   │   │   └── index.ts
│   │   ├── paseto.ts        # PASETO token endpoints
│   │   ├── security/        # Security endpoints
│   │   │   └── index.ts
│   │   ├── tenants.ts       # Multi-tenancy
│   │   ├── users.ts         # User management
│   │   ├── vanuatu.ts       # Vanuatu compliance
│   │   ├── verification.ts  # Verification endpoints
│   │   └── webhooks.ts      # Webhook endpoints
│   └── accessibility.ts      # Accessibility endpoints
│
├── services/                 # Business logic services
│   ├── integrations/        # Third-party service integrations
│   │   ├── FinancialVerificationService.ts
│   │   ├── IntegrationConfig.ts
│   │   ├── PlaidService.ts
│   │   ├── StripeService.ts
│   │   └── index.ts
│   ├── Auth0Service.ts
│   ├── AuthService.ts
│   ├── BackgroundTaskService.ts
│   ├── CSVImportService.ts
│   ├── CivicService.ts
│   ├── DeafAuthService.ts
│   ├── ErrorsAndOmissionsManager.ts
│   ├── FibonorseService.ts
│   ├── FraudDetectionEngine.ts
│   ├── InclusiveAuthManager.ts
│   ├── InclusiveVerificationService.ts
│   ├── PasetoService.ts
│   ├── PinkSyncService.ts
│   ├── ReputationManager.ts
│   ├── RiskAssessmentService.ts
│   ├── RiskManager.ts
│   ├── VanuatuComplianceService.ts
│   ├── WebhookDataService.ts
│   ├── WebhookService.ts
│   ├── WebsiteVerificationService.ts
│   ├── XanoService.ts
│   └── accessibilityService.ts
│
├── db.ts                    # Database connection and configuration
├── index.ts                 # Server entry point
├── routes.ts                # Route definitions
├── storage.ts               # Storage layer (in-memory/database)
└── vite.ts                  # Vite SSR integration
```

#### Services Architecture

Services are organized by domain:

- **Authentication:** Auth0Service, AuthService, DeafAuthService, PasetoService
- **Verification:** InclusiveVerificationService, CivicService, WebsiteVerificationService
- **Financial:** PlaidService, StripeService, FinancialVerificationService
- **Risk & Fraud:** FraudDetectionEngine, RiskAssessmentService, RiskManager
- **Compliance:** VanuatuComplianceService
- **Integration:** WebhookService, PinkSyncService, XanoService
- **Management:** ReputationManager, ErrorsAndOmissionsManager

### Shared (`shared/`)

Code shared between client and server:

```
shared/
└── schema.ts    # Zod schemas for validation and type inference
```

---

## Configuration Files

### Build & Development

| File | Purpose | Key Settings |
|------|---------|-------------|
| `vite.config.ts` | Vite bundler config | Base path, aliases, plugins, build options |
| `tsconfig.json` | TypeScript compiler | Strict mode, module resolution, paths |
| `tailwind.config.ts` | Tailwind CSS | Theme colors, plugins, content paths |
| `postcss.config.js` | PostCSS processing | Tailwind and Autoprefixer |
| `drizzle.config.ts` | Database ORM | Schema location, database connection |

### Deployment

| File | Purpose | Status |
|------|---------|--------|
| `vercel.json` | Vercel deployment | Legacy, may be archived |
| `.vercelignore` | Vercel ignore patterns | Active for Vercel deploys |
| `.env.production` | Production environment | ⚠️ Ensure no secrets |

### Package Management

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, metadata |
| `package-lock.json` | Locked dependency versions |

---

## Documentation

### Main Documentation (`docs/`)

```
docs/
├── sbom/                           # Software Bill of Materials
│   ├── README.md                  # SBOM documentation
│   ├── sbom-cyclonedx.json       # CycloneDX format
│   └── sbom-spdx.json            # SPDX format
│
├── AUDIT_REPORT.md               # Comprehensive audit report (NEW)
├── GITHUB_PAGES_SETUP.md         # GitHub Pages setup guide
├── IMPLEMENTATION_SUMMARY.md     # Implementation summary
├── INCIDENT_RESPONSE.md          # Security incident response
├── PASETO_AUTHENTICATION.md      # PASETO auth documentation
├── README.md                      # Documentation index
├── SECURITY_RITUALS.md           # Security practices framework
├── SECURITY_STATUS.md            # Security status dashboard
├── SECURITY_TRAINING.md          # Security training materials
├── THREAT_MODELING_TEMPLATE.md   # Threat modeling guide
├── agent-merge-policy.md         # Automated merge policy
└── partner_integration_api.md    # Partner API documentation
```

### Root Documentation

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation, badges, quick start |
| `DEPLOY.md` | Deployment instructions for various platforms |

---

## Assets

### Images and Icons

```
attached_assets/
├── 9394268D-510F-4E40-A883-480868BBBD1F.png
├── IMG_2304.png
├── IMG_2307.jpeg
├── IMG_2386.png
├── IMG_2495.png
├── IMG_2496.png
├── IMG_2497.png
└── IMG_2498.jpeg

generated-icon.png    # Application icon (500KB)
```

### Documentation Assets

```
attached_assets/
├── Pasted--Homepage-Overview-of-the-security-API-Quick-start-guide-Key-features-Doc-*.txt
├── Pasted--Security-Integration-Points-Deaf-Specific-Security-Features-Visual-based-authenticat-*.txt
├── Pasted-Here-s-a-step-by-step-guide-to-building-your-blockchain-powered-micro-startup-platform-using-R-*.txt
├── Pasted-Technical-Specification-I-AM-WHO-I-AM-NFT-Identity-System-1-Architecture-Overview--*.txt
└── Pasted-compare-to-any-security-rising-i-want-to-start-NegraRosa-Inclusive-Security-Framework-Core-Philoso-*.txt
```

**Note:** These files contain design specifications and planning documents.

---

## CI/CD

### GitHub Workflows (`.github/workflows/`)

```
workflows/
├── agent-merge-policy.yml        # Automated PR merging
├── daily-security-scan.yml       # Daily security scans
├── deploy-gh-pages.yml           # GitHub Pages deployment
├── generate-sbom.yml             # SBOM generation
├── npm-publish-github-packages.yml  # NPM package publishing
└── pr-security-review.yml        # PR security review
```

#### Workflow Details

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `deploy-gh-pages.yml` | Push to main, manual | Deploy to GitHub Pages |
| `daily-security-scan.yml` | Daily, push, PR | SAST, secrets, dependency scan |
| `pr-security-review.yml` | Pull request | Pre-merge security checks |
| `generate-sbom.yml` | Weekly, release | Generate SBOM |
| `agent-merge-policy.yml` | PR events | Auto-merge approved PRs |
| `npm-publish-github-packages.yml` | Release | Publish to GitHub Packages |

### Dependabot Configuration

```
.github/
└── dependabot.yml    # Automated dependency updates
```

---

## Third-Party Integrations

### Awesome-Hacking

External security resources submodule:

```
Awesome-Hacking/
├── .github/
│   └── workflows/
│       └── lock-threads.yml
├── LICENSE
├── README.md
├── awesome_hacking.jpg
└── contributing.md
```

**Purpose:** Curated list of hacking resources and tools

---

## Archived Files

Files that are archived but kept for reference:

| File | Original Purpose | Status |
|------|-----------------|--------|
| `.replit.archived` | Replit IDE configuration | Archived (not needed for GitHub Pages) |
| `replit.nix.archived` | Nix package manager config | Archived (Replit-specific) |

---

## File Naming Conventions

### TypeScript Files
- **Components:** PascalCase (e.g., `UserProfile.tsx`)
- **Utilities:** camelCase (e.g., `formatDate.ts`)
- **Hooks:** lowercase with prefix (e.g., `use-toast.ts`)
- **Services:** PascalCase with suffix (e.g., `AuthService.ts`)

### Configuration Files
- Lowercase with hyphens (e.g., `vite.config.ts`)
- Extensions indicate format (`.json`, `.ts`, `.js`, `.yml`)

### Documentation
- UPPERCASE for important docs (e.g., `README.md`, `DEPLOY.md`)
- PascalCase for guides (e.g., `SECURITY_RITUALS.md`)

---

## Build Output

When you run `npm run build`, the following structure is generated:

```
dist/
├── public/              # Frontend static assets (for GitHub Pages)
│   ├── assets/
│   │   ├── index-[hash].js
│   │   ├── index-[hash].css
│   │   └── [other chunks]
│   ├── index.html
│   └── [other static files]
│
└── index.js            # Backend server bundle (for Node.js)
```

**Note:** Only `dist/public/` is deployed to GitHub Pages.

---

## Important Paths for Development

### Client Development
- Entry point: `client/src/main.tsx`
- App component: `client/src/App.tsx`
- Add new page: `client/src/pages/`
- Add new component: `client/src/components/`

### Server Development
- Entry point: `server/index.ts`
- Add new API endpoint: `server/api/v1/`
- Add new service: `server/services/`

### Adding Documentation
- Security docs: `docs/`
- Main README: `README.md`
- Deployment docs: `DEPLOY.md`

---

## Path Aliases

Configured in `vite.config.ts` and `tsconfig.json`:

| Alias | Resolves To |
|-------|------------|
| `@/` | `client/src/` |
| `@shared/` | `shared/` |
| `@assets/` | `attached_assets/` |

**Usage Example:**
```typescript
import { Button } from '@/components/ui/button';
import { userSchema } from '@shared/schema';
```

---

## Maintenance Guidelines

### When Adding New Files

1. **Components:** Place in appropriate feature folder in `client/src/components/`
2. **Services:** Add to `server/services/` with descriptive name
3. **Documentation:** Add to `docs/` with descriptive filename
4. **Tests:** Create in future `tests/` directory

### When Removing Files

1. Check for imports/references in other files
2. Update documentation if necessary
3. Consider archiving instead of deleting if historical value

### When Reorganizing

1. Update path aliases if needed
2. Update documentation (this file!)
3. Test build process after changes
4. Update any hardcoded paths

---

## Quick Reference

### Most Important Files

| File | Purpose |
|------|---------|
| `client/src/App.tsx` | Main application component |
| `server/index.ts` | Server entry point |
| `package.json` | Dependencies and scripts |
| `vite.config.ts` | Build configuration |
| `README.md` | Project documentation |
| `.github/workflows/deploy-gh-pages.yml` | Deployment workflow |

### Frequently Modified

| File | When Modified |
|------|--------------|
| `client/src/pages/` | Adding new routes |
| `client/src/components/` | Adding new features |
| `server/api/v1/` | Adding new API endpoints |
| `server/services/` | Adding business logic |
| `docs/` | Updating documentation |
| `package.json` | Adding dependencies |

---

## Related Documentation

- [Audit Report](AUDIT_REPORT.md) - Comprehensive repository audit
- [README](../README.md) - Main project documentation
- [Deployment Guide](../DEPLOY.md) - How to deploy
- [Security Rituals](SECURITY_RITUALS.md) - Security practices
- [GitHub Pages Setup](GITHUB_PAGES_SETUP.md) - GitHub Pages configuration

---

**Last Updated:** December 21, 2025  
**Maintained By:** NegraRosa Development Team  
**Version:** 1.0
