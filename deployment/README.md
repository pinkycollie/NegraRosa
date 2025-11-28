# MBTQ Ecosystem Deployment Guide

## Architecture

```
mbtq.dev (Parent Platform)
├── api.mbtq.dev           → NegraRosa Backend API
├── pinksync.io            → Offline/Online Synchronization
├── 360magicians.com       → Creative Platform (Pathway Magicians)
└── vr4deaf.org            → VR Vocational Rehabilitation Vendor
    └── portal.vr4deaf.org → Case Worker Portal
```

## Server Requirements

- Ubuntu 20.04+ or 22.04+
- 8+ GB RAM
- nginx (8 worker processes)
- Node.js 20+
- Docker & Docker Compose
- Certbot (Let's Encrypt)

## Quick Start

### 1. Run Setup Script

```bash
cd deployment/runner
sudo bash setup-runner.sh
```

This will:
- Install dependencies (Node.js, Docker, nginx, PM2)
- Create GitHub Actions self-hosted runner
- Setup directory structure in `/var/www/`
- Create deployment scripts

### 2. Configure Nginx

```bash
# Copy main nginx config
sudo cp deployment/nginx/nginx.conf /etc/nginx/nginx.conf

# Copy site configs
sudo cp deployment/nginx/sites-available/*.conf /etc/nginx/sites-available/

# Enable sites
sudo ln -s /etc/nginx/sites-available/mbtq.dev.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/pinksync.io.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/360magicians.com.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/vr4deaf.org.conf /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

### 3. SSL Certificates

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificates for each domain
sudo certbot --nginx -d mbtq.dev -d www.mbtq.dev -d api.mbtq.dev
sudo certbot --nginx -d pinksync.io -d www.pinksync.io
sudo certbot --nginx -d 360magicians.com -d www.360magicians.com
```

### 4. Clone Repositories

```bash
cd /var/www/negrarosa && git clone https://github.com/pinkycollie/NegraRosa.git .
cd /var/www/mbtq.dev && git clone https://github.com/pinkycollie/mbtq-dev.git .
cd /var/www/pinksync.io && git clone https://github.com/pinkycollie/pinksync.git .
cd /var/www/360magicians.com && git clone https://github.com/pinkycollie/360magicians.git .
```

### 5. Deploy All

```bash
# Deploy entire ecosystem
deploy-mbtq-all

# Or deploy individually
deploy-negrarosa
deploy-mbtq
deploy-pinksync
deploy-360magicians
```

## Directory Structure

```
/var/www/
├── mbtq.dev/
│   └── public/           # Static files for mbtq.dev
├── pinksync.io/
│   └── public/           # Static files for pinksync.io
├── 360magicians.com/
│   └── public/           # Static files for 360magicians.com
├── vr4deaf.org/
│   └── public/           # Static files for vr4deaf.org
├── negrarosa/            # Backend services (NegraRosa)
└── certbot/              # Let's Encrypt challenge files
```

## Nginx Configuration

### Main Config (`nginx.conf`)
- 8 worker processes
- 4096 connections per worker
- Rate limiting zones:
  - `api_limit`: 10 req/s for API
  - `auth_limit`: 5 req/s for DeafAUTH
  - `conn_limit`: Connection limiting

### Site Configs

| Domain | Config File | Purpose |
|--------|-------------|---------|
| mbtq.dev | mbtq.dev.conf | Parent platform |
| pinksync.io | pinksync.io.conf | Sync service |
| 360magicians.com | 360magicians.com.conf | Creative platform |

## API Endpoints

All sites proxy to the NegraRosa backend at `127.0.0.1:5000`:

| Endpoint | Rate Limit | Description |
|----------|------------|-------------|
| `/api/v1/deafauth/` | 5 req/s | DeafAUTH authentication |
| `/api/v1/pinksync/` | 10 req/s | PinkSync operations |
| `/api/v1/fibonacci/` | 10 req/s | Fibonacci Security |
| `/ws/` | - | WebSocket connections |

## GitHub Actions Self-Hosted Runner

After setup, the runner will be available with labels:
- `self-hosted`
- `ubuntu`
- `mbtq`
- `mbtq-dev`
- `deafauth`
- `pinksync`
- `fibonrose`

### Using the Runner

```yaml
jobs:
  deploy:
    runs-on: [self-hosted, mbtq]
    steps:
      - uses: actions/checkout@v4
      - run: deploy-negrarosa
```

## PM2 Process Management

```bash
# View all processes
pm2 status

# View logs
pm2 logs negrarosa
pm2 logs pinksync

# Restart all
pm2 restart all

# Save process list
pm2 save
```

## Monitoring

```bash
# Nginx status
sudo systemctl status nginx

# Runner status
cd /home/github-runner/actions-runner
./svc.sh status

# PM2 monitoring
pm2 monit
```

## Security Features

- TLS 1.2+ only
- Security headers (X-Frame-Options, CSP, etc.)
- Rate limiting on all API endpoints
- Stricter rate limiting on authentication
- Non-root nginx worker processes
- CORS configured for MBTQ ecosystem domains

## Troubleshooting

### Nginx won't start
```bash
sudo nginx -t  # Check config
sudo journalctl -u nginx  # View logs
```

### Runner not connecting
```bash
cd /home/github-runner/actions-runner
./svc.sh status
./svc.sh stop
./svc.sh start
```

### SSL certificate issues
```bash
sudo certbot renew --dry-run  # Test renewal
sudo certbot certificates    # List certs
```
