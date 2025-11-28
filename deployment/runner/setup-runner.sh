#!/bin/bash
# NegraRosa Self-Hosted GitHub Actions Runner Setup
# For Ubuntu Server with nginx
#
# MBTQ Ecosystem Structure:
#   - mbtq.dev (Parent Platform)
#     ├── pinksync.io (Offline/Online Sync)
#     ├── 360magicians.com (Creative Platform)
#     ├── vr4deaf.org (VR Accessibility)
#     └── NegraRosa (Backend Services)
#
# Usage: sudo bash setup-runner.sh
#
# Prerequisites:
#   - Ubuntu 20.04+ or 22.04+
#   - sudo access
#   - GitHub Personal Access Token with 'repo' scope

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== MBTQ.dev Ecosystem - Self-Hosted Runner Setup ===${NC}"
echo -e "${BLUE}    Parent: mbtq.dev${NC}"
echo -e "${BLUE}    Children: pinksync.io, 360magicians.com, vr4deaf.org${NC}"
echo ""

# Configuration
RUNNER_USER="github-runner"
RUNNER_HOME="/home/${RUNNER_USER}"
RUNNER_DIR="${RUNNER_HOME}/actions-runner"
RUNNER_VERSION="2.311.0"  # Update to latest version
WORK_DIR="/var/www"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root (use sudo)${NC}"
   exit 1
fi

# Prompt for GitHub token
read -p "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}GitHub token is required${NC}"
    exit 1
fi

# Repository info
GITHUB_OWNER="pinkycollie"
GITHUB_REPO="NegraRosa"

echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
apt-get update
apt-get install -y \
    curl \
    jq \
    git \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3 \
    python3-pip \
    docker.io \
    docker-compose

# Install Node.js 20
echo -e "${YELLOW}Step 2: Installing Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Create runner user
echo -e "${YELLOW}Step 3: Creating runner user...${NC}"
if ! id "$RUNNER_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$RUNNER_USER"
    usermod -aG docker "$RUNNER_USER"
    usermod -aG www-data "$RUNNER_USER"
fi

# Create work directories for MBTQ ecosystem
echo -e "${YELLOW}Step 4: Creating MBTQ ecosystem directories...${NC}"
mkdir -p "$WORK_DIR/mbtq.dev/public"          # Parent platform
mkdir -p "$WORK_DIR/pinksync.io/public"       # PinkSync
mkdir -p "$WORK_DIR/360magicians.com/public"  # 360Magicians
mkdir -p "$WORK_DIR/vr4deaf.org/public"       # VR4Deaf
mkdir -p "$WORK_DIR/negrarosa"                # Backend services
mkdir -p "$WORK_DIR/certbot"                  # SSL certificates

chown -R "$RUNNER_USER:www-data" "$WORK_DIR"
chmod -R 775 "$WORK_DIR"

# Download and configure runner
echo -e "${YELLOW}Step 5: Downloading GitHub Actions Runner...${NC}"
mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L \
    https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

tar xzf actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
rm actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

chown -R "$RUNNER_USER:$RUNNER_USER" "$RUNNER_DIR"

# Get registration token
echo -e "${YELLOW}Step 6: Getting registration token...${NC}"
REG_TOKEN=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runners/registration-token" | jq -r '.token')

if [ "$REG_TOKEN" = "null" ] || [ -z "$REG_TOKEN" ]; then
    echo -e "${RED}Failed to get registration token. Check your GitHub token permissions.${NC}"
    exit 1
fi

# Configure runner
echo -e "${YELLOW}Step 7: Configuring runner...${NC}"
cd "$RUNNER_DIR"
sudo -u "$RUNNER_USER" ./config.sh \
    --url "https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}" \
    --token "$REG_TOKEN" \
    --name "mbtq-ubuntu-runner" \
    --labels "self-hosted,ubuntu,mbtq,mbtq-dev,deafauth,pinksync,fibonrose" \
    --work "_work" \
    --unattended

# Install as service
echo -e "${YELLOW}Step 8: Installing as systemd service...${NC}"
./svc.sh install "$RUNNER_USER"
./svc.sh start

# Create deployment scripts
echo -e "${YELLOW}Step 9: Creating MBTQ ecosystem deployment scripts...${NC}"

# Create deploy script for MBTQ.dev (Parent)
cat > /usr/local/bin/deploy-mbtq << 'EOF'
#!/bin/bash
# Deploy MBTQ.dev (Parent Platform)
set -e

echo "Deploying MBTQ.dev..."
cd /var/www/mbtq.dev

# Pull latest
git pull origin main

# Install dependencies
npm ci --production

# Build
npm run build

# Copy to public
cp -r dist/* public/

# Restart app
pm2 restart mbtq-dev || pm2 start dist/index.js --name mbtq-dev

echo "MBTQ.dev deployed successfully!"
EOF
chmod +x /usr/local/bin/deploy-mbtq

# Create deploy script for PinkSync.io
cat > /usr/local/bin/deploy-pinksync << 'EOF'
#!/bin/bash
# Deploy PinkSync.io
set -e

echo "Deploying PinkSync.io..."
cd /var/www/pinksync.io

# Pull latest
git pull origin main

# Install dependencies
npm ci --production

# Build
npm run build

# Copy to public
cp -r dist/* public/

# Restart app
pm2 restart pinksync || pm2 start dist/index.js --name pinksync

echo "PinkSync.io deployed successfully!"
EOF
chmod +x /usr/local/bin/deploy-pinksync

# Create deploy script for 360Magicians.com
cat > /usr/local/bin/deploy-360magicians << 'EOF'
#!/bin/bash
# Deploy 360Magicians.com
set -e

echo "Deploying 360Magicians.com..."
cd /var/www/360magicians.com

# Pull latest
git pull origin main

# Install dependencies
npm ci --production

# Build
npm run build

# Copy to public
cp -r dist/* public/

# Restart app
pm2 restart 360magicians || pm2 start dist/index.js --name 360magicians

echo "360Magicians.com deployed successfully!"
EOF
chmod +x /usr/local/bin/deploy-360magicians

# Create deploy script for NegraRosa (Backend)
cat > /usr/local/bin/deploy-negrarosa << 'EOF'
#!/bin/bash
# Deploy NegraRosa Backend
set -e

echo "Deploying NegraRosa backend..."
cd /var/www/negrarosa

# Pull latest
git pull origin main

# Install dependencies
npm ci --production

# Build
npm run build

# Restart with PM2
pm2 restart negrarosa || pm2 start dist/index.js --name negrarosa --env production

echo "NegraRosa deployed successfully!"
EOF
chmod +x /usr/local/bin/deploy-negrarosa

# Create master deploy script for all MBTQ ecosystem
cat > /usr/local/bin/deploy-mbtq-all << 'EOF'
#!/bin/bash
# Deploy entire MBTQ ecosystem
set -e

echo "=== Deploying MBTQ Ecosystem ==="
echo ""

echo "1/4 Deploying NegraRosa backend..."
deploy-negrarosa

echo ""
echo "2/4 Deploying MBTQ.dev (Parent)..."
deploy-mbtq

echo ""
echo "3/4 Deploying PinkSync.io..."
deploy-pinksync

echo ""
echo "4/4 Deploying 360Magicians.com..."
deploy-360magicians

echo ""
echo "=== MBTQ Ecosystem Deployed Successfully ==="
pm2 status
EOF
chmod +x /usr/local/bin/deploy-mbtq-all

# Install PM2
echo -e "${YELLOW}Step 10: Installing PM2...${NC}"
npm install -g pm2
pm2 startup systemd -u "$RUNNER_USER" --hp "$RUNNER_HOME"

# Configure nginx
echo -e "${YELLOW}Step 11: Configuring nginx...${NC}"
# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
fi

# Enable nginx
systemctl enable nginx
systemctl start nginx

echo ""
echo -e "${GREEN}=== MBTQ Ecosystem Setup Complete! ===${NC}"
echo ""
echo -e "${BLUE}Runner Status:${NC}"
./svc.sh status

echo ""
echo -e "${BLUE}Directory Structure:${NC}"
echo "  /var/www/"
echo "  ├── mbtq.dev/          (Parent Platform)"
echo "  ├── pinksync.io/       (Offline/Online Sync)"
echo "  ├── 360magicians.com/  (Creative Platform)"
echo "  ├── vr4deaf.org/       (VR Accessibility)"
echo "  ├── negrarosa/         (Backend Services)"
echo "  └── certbot/           (SSL Certificates)"

echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Copy nginx configs:"
echo "   sudo cp deployment/nginx/nginx.conf /etc/nginx/nginx.conf"
echo "   sudo cp deployment/nginx/sites-available/*.conf /etc/nginx/sites-available/"
echo ""
echo "2. Enable sites:"
echo "   sudo ln -s /etc/nginx/sites-available/mbtq.dev.conf /etc/nginx/sites-enabled/"
echo "   sudo ln -s /etc/nginx/sites-available/pinksync.io.conf /etc/nginx/sites-enabled/"
echo "   sudo ln -s /etc/nginx/sites-available/360magicians.com.conf /etc/nginx/sites-enabled/"
echo ""
echo "3. Get SSL certificates:"
echo "   sudo certbot --nginx -d mbtq.dev -d www.mbtq.dev -d api.mbtq.dev"
echo "   sudo certbot --nginx -d pinksync.io -d www.pinksync.io"
echo "   sudo certbot --nginx -d 360magicians.com -d www.360magicians.com"
echo ""
echo "4. Test nginx:"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "5. Clone repositories:"
echo "   cd /var/www/negrarosa && git clone https://github.com/pinkycollie/NegraRosa.git ."
echo "   cd /var/www/mbtq.dev && git clone https://github.com/pinkycollie/mbtq-dev.git ."
echo "   cd /var/www/pinksync.io && git clone https://github.com/pinkycollie/pinksync.git ."
echo ""
echo "6. Deploy all:"
echo "   deploy-mbtq-all"
echo ""
echo -e "${GREEN}Self-hosted runner is now active at:${NC}"
echo "https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/settings/actions/runners"
