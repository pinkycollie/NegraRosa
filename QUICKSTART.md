# Quick Start Guide for Developers

This guide will help you get started with the NegraRosa Inclusive Security Framework as a developer.

## Prerequisites

- Node.js 20 or higher
- npm or yarn
- PostgreSQL (for local development)
- Git

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/pinkycollie/NegraRosa.git
cd NegraRosa
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure the following essential variables:

```bash
# Core settings
NODE_ENV=development
PORT=5000
PERSISTENCE=false  # Use ephemeral data in development

# Database (local PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/negrarosa_dev

# Session secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your-generated-secret-here
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:5000`

## Essential Commands

```bash
# Development
npm run dev          # Start development server with hot reload

# Building
npm run build        # Build for production

# Testing
npm test             # Run all tests
npm run check        # TypeScript type checking

# Database
npm run db:push      # Push database schema changes

# Security
npm audit            # Check for vulnerabilities
npm run spectral     # Run OpenAPI linting (if configured)
```

## Project Structure

```
NegraRosa/
├── .github/                    # GitHub workflows and templates
│   ├── workflows/             # CI/CD workflows
│   └── CODEOWNERS            # Code review assignments
├── api/                       # Legacy API routes
├── client/                    # React frontend
├── server/                    # Backend server
│   ├── api/                  # API endpoints
│   ├── services/             # Business logic services
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # Route definitions
│   └── storage.ts            # Data access layer
├── docs/                      # Documentation
│   ├── partner_integration_api.md
│   ├── templates/            # Document templates
│   └── incidents/            # Security incident reports
├── shared/                    # Shared code between client/server
├── agents.md                  # Agent documentation (READ THIS!)
├── SECURITY.md               # Security policy
├── package.json              # Dependencies and scripts
└── .env.example              # Environment variable template
```

## Security Best Practices

Before you start coding, read these important documents:

1. **[agents.md](./agents.md)** - Comprehensive guide to agent capabilities and security policies
2. **[SECURITY.md](./SECURITY.md)** - Security policy and vulnerability reporting

### Key Security Principles

- **Never commit secrets** - Use environment variables for all sensitive data
- **Default to ephemeral** - Set `PERSISTENCE=false` in development
- **Validate all inputs** - Use Zod schemas for validation
- **Use parameterized queries** - Prevent SQL injection
- **Redact PII** - Use middleware to redact sensitive data from logs
- **Short-lived tokens** - Session tokens expire in 15 minutes

## Making Your First Contribution

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Follow the coding standards in the existing codebase:
- Use TypeScript
- Add types for all functions
- Write unit tests for new functionality
- Update documentation

### 3. Run Security Checks

```bash
# Check for TypeScript errors
npm run check

# Run security audit
npm audit

# Check for banned imports (manual)
grep -r "import.*drizzle" ./api/
grep -r "import.*pg\>" ./api/
```

### 4. Commit Your Changes

Use descriptive commit messages:

```bash
git add .
git commit -m "feat: add new verification endpoint"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub. The PR template will guide you through the required checks.

## Common Development Tasks

### Adding a New API Endpoint

1. Define route in `server/routes.ts`
2. Create handler in `server/api/v1/`
3. Add Zod schema for request validation
4. Implement business logic in `server/services/`
5. Add unit tests
6. Update API documentation

### Adding a New Service Integration

1. Create service class in `server/services/integrations/`
2. Add configuration to `.env.example`
3. Store secrets in environment variables (not code)
4. Add authentication and rate limiting
5. Log all external API calls for audit
6. Add integration tests
7. Update [partner_integration_api.md](./docs/partner_integration_api.md)

### Working with the Database

```bash
# Make schema changes in shared/schemas/
# Then push to database
npm run db:push
```

**Important**: Never import database clients directly in `/api/` directory. Use the storage layer (`server/storage.ts`) instead.

## Troubleshooting

### TypeScript Errors

If you see type errors after installing dependencies:

```bash
npm install
npm run check
```

### Database Connection Issues

Check your `DATABASE_URL` in `.env`:

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Port Already in Use

If port 5000 is taken:

```bash
# Change PORT in .env
PORT=5001
```

### Build Failures

Clear caches and reinstall:

```bash
rm -rf node_modules dist
npm install
npm run build
```

## Testing

### Unit Tests

```bash
npm test                    # Run all tests
npm test -- --watch        # Run tests in watch mode
npm test -- path/to/test   # Run specific test
```

### Integration Tests

```bash
npm run test:integration
```

### Manual API Testing

Use curl or tools like Postman:

```bash
# Health check
curl http://localhost:5000/api/v1/agents/health

# With authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/v1/agents/attestations
```

## Getting Help

- **General questions**: Open an issue on GitHub
- **Security concerns**: Email security@mbtq.dev
- **Documentation**: Check [docs/](./docs/) directory
- **API reference**: See [docs/partner_integration_api.md](./docs/partner_integration_api.md)

## Next Steps

1. Read [agents.md](./agents.md) to understand agent capabilities
2. Review [SECURITY.md](./SECURITY.md) for security guidelines
3. Check existing issues and pick one to work on
4. Join team discussions on pull requests
5. Share your feedback and improvements

## Resources

- [NegraRosa GitHub Repository](https://github.com/pinkycollie/NegraRosa)
- [Agent Documentation](./agents.md)
- [Security Policy](./SECURITY.md)
- [Partner Integration API](./docs/partner_integration_api.md)
- [Deployment Guide](./DEPLOY.md)

---

**Welcome to NegraRosa! We're excited to have you contribute to the Inclusive Security Framework.**

For questions or support, reach out via GitHub issues or email the team.
