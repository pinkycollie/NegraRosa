# Deploying NegraRosa

This document outlines deployment options for the NegraRosa Inclusive Security Framework.

## 🚀 Primary Deployment: GitHub Pages (Recommended)

The application is automatically deployed to GitHub Pages on every push to the `main` branch.

**Live URL:** [https://pinkycollie.github.io/NegraRosa/](https://pinkycollie.github.io/NegraRosa/)

### Automatic Deployment

1. **Push to main branch:**
   ```bash
   git push origin main
   ```

2. **Monitor deployment:**
   - Go to: [GitHub Actions](https://github.com/pinkycollie/NegraRosa/actions)
   - Watch "Deploy to GitHub Pages" workflow
   - Deployment takes ~2-5 minutes

3. **Verify deployment:**
   - Visit: https://pinkycollie.github.io/NegraRosa/
   - Test functionality
   - Check browser console for errors

### Manual Deployment Trigger

1. Go to [Actions](https://github.com/pinkycollie/NegraRosa/actions)
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow" button

### Prerequisites

✅ **Already configured:**
- GitHub Actions workflow (`.github/workflows/deploy-gh-pages.yml`)
- Repository settings → Pages → Source: GitHub Actions
- Build configuration (`vite.config.ts`)
- SPA routing handler (`404.html`)

### Build Process

The deployment workflow:
1. Installs Node.js 20
2. Installs dependencies (`npm ci`)
3. Builds the application (`npm run build:client`)
4. Copies static files (404.html, .nojekyll, icon)
5. Uploads to GitHub Pages
6. Deploys to production

### Configuration

**Build settings in `vite.config.ts`:**
- Base path: `./` (relative paths for GitHub Pages)
- Output directory: `dist/public`
- Code splitting enabled (vendor, ui chunks)
- Minification: esbuild
- Source maps: disabled in production

**GitHub Actions permissions:**
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Troubleshooting

**Build fails:**
```bash
# Test locally
npm ci
npm run build:client
```

**404 errors on routes:**
- Verify `404.html` exists in `client/public/`
- Check SPA routing handler in `main.tsx`

**Assets not loading:**
- Check base path in `vite.config.ts` is `./`
- Verify workflow copies files correctly

For detailed deployment checklist, see [DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md).

---

## 📖 Complete Documentation

- **[GitHub Pages Setup Guide](docs/GITHUB_PAGES_SETUP.md)** - Detailed configuration
- **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** - Step-by-step verification
- **[File Structure](docs/FILE_STRUCTURE.md)** - Repository organization
- **[Audit Report](docs/AUDIT_REPORT.md)** - Comprehensive audit

---

## 🔄 Alternative Deployment: Vercel (Legacy)

For historical reference, Vercel deployment was previously supported.

### Vercel Configuration (Legacy)

The repository includes `vercel.json` for Vercel deployment, but GitHub Pages is now the primary deployment target.

If you need to deploy to Vercel:

1. **Connect repository to Vercel**
2. **Configure environment variables:**
   - `DATABASE_URL`: PostgreSQL connection string
   - `NODE_ENV`: `production`
   - Additional API keys as needed

3. **Deploy:**
   - Automatic on push to main
   - Or manual deploy from Vercel dashboard

**Note:** The build process for Vercel is different as it includes the backend server. GitHub Pages deployment is frontend-only.

---

## 🏗️ Local Development

### Setup

```bash
# Clone repository
git clone https://github.com/pinkycollie/NegraRosa.git
cd NegraRosa

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Server

- **URL:** http://localhost:5000
- **Hot reload:** Enabled
- **TypeScript:** Real-time type checking

### Build Locally

```bash
# Build frontend only (for GitHub Pages)
npm run build:client

# Build full stack (frontend + backend)
npm run build

# Preview production build
npm run preview
```

### Type Checking

```bash
npm run check
```

### Security Audit

```bash
npm audit
npm audit fix  # Fix non-breaking issues
```

---

## 🔐 Environment Variables

### For GitHub Pages

GitHub Pages deployment is **frontend-only** and **static**. Environment variables must be:

1. **Prefixed with `VITE_`** to be exposed to the client
2. **Set at build time** (not runtime)
3. **Not contain secrets** (everything is public in client code)

**Example:**
```env
VITE_API_URL=https://api.negrarosa.com
VITE_ENVIRONMENT=production
```

### For Backend/Server Deployment

If deploying the backend:

```env
DATABASE_URL=postgresql://...
XANO_API_KEY=...
NOTION_API_KEY=...
AUTH0_CLIENT_SECRET=...
NODE_ENV=production
PORT=3000
```

⚠️ **Security:** Never commit real secrets. Use GitHub Secrets or platform environment variables.

---

## 📊 Deployment Monitoring

### GitHub Actions

Monitor deployment status:
- **Workflows:** https://github.com/pinkycollie/NegraRosa/actions
- **Deployments:** https://github.com/pinkycollie/NegraRosa/deployments
- **Badge:** [![Deploy](https://github.com/pinkycollie/NegraRosa/actions/workflows/deploy-gh-pages.yml/badge.svg)](https://github.com/pinkycollie/NegraRosa/actions/workflows/deploy-gh-pages.yml)

### Post-Deployment Checks

1. **Accessibility:** Site loads successfully
2. **Functionality:** All routes work
3. **Performance:** Load times acceptable
4. **Security:** HTTPS enabled, no console errors
5. **Analytics:** Monitor traffic (if configured)

---

## 🚨 Rollback

If deployment issues occur:

### Option 1: Revert Commit
```bash
git revert HEAD
git push origin main
```

### Option 2: Revert to Specific Version
```bash
git reset --hard <commit-hash>
git push origin main --force  # Use with caution
```

### Option 3: Manual Rollback
1. Go to [Actions](https://github.com/pinkycollie/NegraRosa/actions)
2. Find last successful deployment
3. Click "Re-run jobs"

---

## 📝 Deployment Notes

### What Gets Deployed

**GitHub Pages (current):**
- ✅ Frontend React application
- ✅ Static assets (images, icons)
- ✅ CSS and JavaScript bundles
- ❌ Backend server (not included)
- ❌ Database (not included)

**Full Stack Deployment (e.g., Vercel):**
- ✅ Frontend
- ✅ Backend API
- ✅ Database connection
- ✅ Server-side rendering (if configured)

### Deployment Timeline

- **Build time:** 2-3 minutes
- **Deployment time:** 1-2 minutes
- **Total:** ~3-5 minutes from push to live

### Deployment Frequency

- **Automatic:** Every push to main
- **Manual:** As needed via workflow dispatch
- **Recommended:** 1-2 times per week for regular updates
- **Hotfixes:** Immediately as needed

---

## 🎯 Best Practices

1. **Test locally first:** Always build and test before deploying
2. **Use branches:** Develop on feature branches, merge to main for deployment
3. **Review changes:** Code review before merging to main
4. **Monitor deployment:** Watch Actions for successful deployment
5. **Verify post-deployment:** Test site after deployment
6. **Security scans:** Automated daily scans run continuously
7. **Documentation:** Keep deployment docs updated

---

## 📞 Support

### Deployment Issues

1. Check [Actions logs](https://github.com/pinkycollie/NegraRosa/actions)
2. Review [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)
3. Check [GitHub Pages status](https://www.githubstatus.com/)
4. Open issue in repository

### Security Issues

- **DO NOT** create public issues for security vulnerabilities
- Contact Security Council (see [SECURITY_STATUS.md](docs/SECURITY_STATUS.md))
- Follow responsible disclosure process

---

## 🔗 Additional Resources

- **[GitHub Pages Documentation](https://docs.github.com/en/pages)**
- **[GitHub Actions Documentation](https://docs.github.com/en/actions)**
- **[Vite Documentation](https://vitejs.dev/)**
- **[React Documentation](https://react.dev/)**

---

**Last Updated:** December 21, 2025  
**Deployment Method:** GitHub Pages (Automatic)  
**Status:** ✅ Active and Operational