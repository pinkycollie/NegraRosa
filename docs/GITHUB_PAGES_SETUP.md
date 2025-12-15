# Enabling GitHub Pages for NegraRosa

This guide walks through enabling GitHub Pages for the NegraRosa project.

## Prerequisites

- Repository owner or admin access
- GitHub Actions workflow already configured (`.github/workflows/deploy-gh-pages.yml`)

## Steps to Enable GitHub Pages

### 1. Access Repository Settings

1. Go to your GitHub repository: https://github.com/pinkycollie/NegraRosa
2. Click on **Settings** (top navigation)
3. Scroll down to **Pages** in the left sidebar

### 2. Configure GitHub Pages

**Source Configuration:**

1. Under "Build and deployment", select:
   - **Source:** GitHub Actions
   
   This tells GitHub to use the workflow file we created instead of a branch.

2. Click **Save**

### 3. Verify Deployment Workflow

The deployment workflow (`.github/workflows/deploy-gh-pages.yml`) will:

1. **Build the application:**
   - Install Node.js dependencies
   - Run `npm run build`
   - Generate static files in `dist/public`

2. **Deploy to GitHub Pages:**
   - Upload the built files
   - Deploy to GitHub Pages
   - Provide a URL

### 4. Wait for First Deployment

After enabling GitHub Pages:

1. Push to `main` branch or manually trigger the workflow
2. Go to **Actions** tab
3. Watch the "Deploy to GitHub Pages" workflow
4. Once complete, your site will be available at:
   ```
   https://pinkycollie.github.io/NegraRosa/
   ```

### 5. Verify Deployment

1. Visit the GitHub Pages URL
2. Check that the application loads correctly
3. Test key functionality

## Troubleshooting

### Build Fails

If the build fails:

1. Check the GitHub Actions logs
2. Common issues:
   - Missing environment variables
   - Build script errors
   - Node.js version mismatch

**Solution:**
```bash
# Test the build locally first
npm run build

# Check the output directory
ls -la dist/public
```

### 404 Error on GitHub Pages

If you see a 404 error:

1. Verify the workflow uploaded the correct path
2. Check that `dist/public` contains an `index.html`
3. Ensure the workflow completed successfully

### Permissions Issues

If you see permission errors:

1. Check that the workflow has correct permissions:
   ```yaml
   permissions:
     contents: read
     pages: write
     id-token: write
   ```

2. Verify GitHub Actions is enabled for the repository

### Custom Domain (Optional)

To use a custom domain:

1. In repository settings, under Pages:
2. Enter your custom domain
3. Add DNS records:
   - `A` records pointing to GitHub Pages IPs
   - `CNAME` record: `your-domain.com` → `pinkycollie.github.io`
4. Enable HTTPS (automatic after DNS propagation)

## Configuration Details

### Current Workflow Configuration

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]  # Deploys on push to main
  workflow_dispatch:  # Manual trigger available

permissions:
  contents: read
  pages: write
  id-token: write

# Build process:
# 1. Checkout code
# 2. Setup Node.js 20
# 3. Install dependencies (npm ci)
# 4. Build (npm run build)
# 5. Upload artifact from dist/public
# 6. Deploy to GitHub Pages
```

### Build Output

The build creates:
```
dist/
└── public/
    ├── index.html
    ├── assets/
    │   ├── index-[hash].js
    │   └── index-[hash].css
    └── [other static files]
```

### Environment Variables

For production builds, ensure these are set:
- `NODE_ENV=production` (automatically set in workflow)
- Other environment variables should be configured in GitHub Secrets

## Deployment Status

Monitor deployment status:

1. **Badge in README:**
   ```markdown
   [![Deploy to GitHub Pages](https://github.com/pinkycollie/NegraRosa/actions/workflows/deploy-gh-pages.yml/badge.svg)](https://github.com/pinkycollie/NegraRosa/actions/workflows/deploy-gh-pages.yml)
   ```

2. **Actions Page:**
   https://github.com/pinkycollie/NegraRosa/actions/workflows/deploy-gh-pages.yml

3. **Deployments Page:**
   https://github.com/pinkycollie/NegraRosa/deployments

## Security Considerations

### Public Repository

GitHub Pages sites from public repositories are publicly accessible.

**Ensure:**
- No secrets in the codebase
- No sensitive data in the deployment
- API calls use environment-appropriate endpoints
- Authentication handled securely (not client-side secrets)

### Environment Configuration

For different environments:

```typescript
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.negrarosa.com',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};
```

## Continuous Deployment

Every push to `main` automatically:
1. Runs security scans
2. Builds the application
3. Deploys to GitHub Pages
4. Updates the live site

**Timeline:**
- Typical deployment: 2-5 minutes
- Availability: Within 1 minute after deployment

## Manual Deployment

To manually trigger a deployment:

1. Go to **Actions** tab
2. Select "Deploy to GitHub Pages"
3. Click **Run workflow**
4. Select branch (main)
5. Click **Run workflow**

## Rollback Procedure

If a deployment causes issues:

1. **Option 1: Revert the commit**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Option 2: Deploy previous version**
   ```bash
   git checkout <previous-commit>
   git push origin main --force  # Use with caution
   ```

3. **Option 3: Use deployment history**
   - Go to Deployments page
   - Select a previous successful deployment
   - Click "Re-run jobs"

## Monitoring

After deployment, monitor:

1. **Application health:**
   - Check all routes load
   - Test key features
   - Verify API connections

2. **Performance:**
   - Load times
   - Asset sizes
   - Network requests

3. **Errors:**
   - Browser console
   - Network errors
   - 404s in deployment

## Support

For issues with GitHub Pages:

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Troubleshooting Guide](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites)

---

**Next Steps:**
1. Enable GitHub Pages in repository settings
2. Push to main or manually trigger workflow
3. Verify deployment at GitHub Pages URL
4. Update README with live URL
5. Configure custom domain (optional)
