# NegraRosa Deployment Guide

MBTQ Security Platform with DeafAUTH Accessibility Support

## Deployment Options

This project supports multiple deployment methods:

1. **Docker (Recommended)** - Simple, portable deployment
2. **Local Node.js** - Direct Node.js deployment
3. **Cloud Platforms** - GCP, AWS, or any container platform

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- Git (for cloning the repository)

### Step 1: Clone and Configure

```bash
# Clone the repository
git clone https://github.com/pinkycollie/NegraRosa.git
cd NegraRosa

# Copy environment configuration
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

### Step 2: Start the Application

```bash
# Start all services (app, database, redis)
docker compose up -d

# Check logs
docker compose logs -f app

# Verify the application is running
curl http://localhost:5000/api/v1/supabase/status
```

### Step 3: Access the Application

- Application: http://localhost:5000
- API Documentation: http://localhost:5000/api/v1

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for JWT tokens | Generate a random 64-char string |

### Supabase OAuth (Recommended)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

### Optional Integrations

| Variable | Description |
|----------|-------------|
| `CIVIC_APP_ID` | Civic ID app identifier |
| `OPENAI_API_KEY` | OpenAI API for accessibility guidance |
| `STRIPE_SECRET_KEY` | Stripe for payments |

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 15+

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npm run check

# Build for production
npm run build
```

## DeafAUTH Accessibility Features

The platform includes comprehensive accessibility support:

### Available Authentication Methods

1. **Visual Pattern** - Draw patterns on a grid
2. **QR Code Scan** - Scan QR codes for authentication
3. **Biometric** - Face or fingerprint recognition
4. **Sign Language Video** - ASL/BSL/ISL verification
5. **Visual OTP** - Color-coded or icon-based codes
6. **NFC Tap** - Contactless card authentication

### API Endpoints

```bash
# Get available methods
GET /api/v1/deafauth/methods

# Initialize session
POST /api/v1/deafauth/session
{
  "userId": 123,
  "method": "visual_pattern",
  "preferences": {
    "highContrast": true,
    "largeText": true
  }
}

# Verify authentication
POST /api/v1/deafauth/verify
{
  "sessionId": "...",
  "response": { "pattern": [1, 2, 5, 8, 9] }
}
```

## PinkSync Offline Support

Enable seamless offline/online synchronization:

```bash
# Register device
POST /api/v1/pinksync/device
{
  "userId": 123,
  "deviceName": "iPhone",
  "deviceType": "mobile"
}

# Queue operation for sync
POST /api/v1/pinksync/operation
{
  "deviceId": "...",
  "type": "update",
  "entity": "preferences",
  "entityId": "123",
  "data": { ... }
}

# Sync device
POST /api/v1/pinksync/sync/{deviceId}
```

## CI/CD with GitHub Actions

The repository includes automated workflows:

### Workflows

1. **ci-cd.yml** - Main CI/CD pipeline
   - Lint and type check
   - Build application
   - Security scanning
   - Docker image build
   - Deployment

2. **autodevops.yml** - Extended DevOps
   - Code quality checks
   - Accessibility validation
   - Container builds
   - Attestation generation
   - Automated releases

### Triggering Deployments

- **Push to `main`**: Production deployment
- **Push to `develop`**: Staging deployment
- **Pull requests**: Build and test only

## Security Considerations

1. **Never commit `.env` files** - Use `.env.example` as a template
2. **Rotate secrets regularly** - Update JWT_SECRET periodically
3. **Use HTTPS** - Always use TLS in production
4. **Enable rate limiting** - Protect against abuse
5. **Keep dependencies updated** - Run `npm audit` regularly

## Monitoring

### Health Check Endpoints

```bash
# DeafAUTH status
GET /api/v1/deafauth/status

# PinkSync status
GET /api/v1/pinksync/status

# Fibonacci Security status
GET /api/v1/fibonacci/status
```

### Docker Health Checks

```bash
# Check container health
docker compose ps

# View container logs
docker compose logs -f app
```

## Troubleshooting

### Common Issues

1. **Database connection fails**
   - Check DATABASE_URL format
   - Ensure PostgreSQL is running
   - Verify network connectivity

2. **Build fails**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version: `node --version`

3. **Authentication errors**
   - Verify JWT_SECRET is set
   - Check Supabase configuration
   - Ensure tokens haven't expired

## Support

- **Issues**: https://github.com/pinkycollie/NegraRosa/issues
- **Documentation**: See `/docs` folder