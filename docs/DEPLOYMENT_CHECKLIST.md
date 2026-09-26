# NegraRosa Deployment Checklist

This checklist ensures smooth, secure, and compliant deployments of the NegraRosa Inclusive Security Framework.

---

## Pre-Deployment Checklist

### 1. Code Quality & Security ✅

#### Code Review
- [ ] All code changes reviewed by at least one team member
- [ ] No "TODO" or "FIXME" comments in production code
- [ ] No console.log() or debug statements in production code
- [ ] Code follows project conventions and style guide
- [ ] TypeScript strict mode passes with no errors

#### Security Scan
- [ ] Run security scan: `npm audit`
- [ ] Address all critical and high vulnerabilities
- [ ] Review moderate vulnerabilities
- [ ] No secrets or API keys in codebase
- [ ] Environment variables properly configured

#### Testing
- [ ] Run TypeScript checks: `npm run check`
- [ ] All tests passing (when implemented)
- [ ] Manual testing of critical user flows
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices (iOS, Android)

### 2. Build Verification ✅

#### Local Build
```bash
# Clean install dependencies
npm ci

# Run build
npm run build:client

# Verify build output
ls -la dist/public
```

- [ ] Build completes without errors
- [ ] Build completes without warnings (or warnings documented)
- [ ] dist/public/ contains index.html
- [ ] dist/public/assets/ contains JS and CSS files
- [ ] Total bundle size is reasonable (< 2MB)

#### Build Artifacts
- [ ] index.html present with correct meta tags
- [ ] 404.html present for SPA routing
- [ ] Assets folder contains all required files
- [ ] Icons and images copied to build
- [ ] CSS properly bundled

### 3. Configuration ✅

#### Environment Variables
- [ ] All required environment variables documented
- [ ] No secrets in .env.production
- [ ] GitHub Secrets configured (if needed)
- [ ] API endpoints point to production
- [ ] Feature flags set correctly

#### GitHub Pages Settings
- [ ] Repository settings → Pages → Source: GitHub Actions
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS enforced
- [ ] Branch protection rules active

#### Workflow Configuration
- [ ] .github/workflows/deploy-gh-pages.yml configured
- [ ] Workflow has correct permissions
- [ ] Build command is correct: `npm run build:client`
- [ ] Upload path is correct: `./dist/public`

### 4. Documentation ✅

- [ ] README.md updated with live URL
- [ ] DEPLOY.md reflects current process
- [ ] CHANGELOG updated (if applicable)
- [ ] API documentation current
- [ ] Known issues documented

### 5. Accessibility ✅

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA standards
- [ ] Alt text on all images
- [ ] ARIA labels where appropriate
- [ ] Visual feedback for all actions

---

## Deployment Process

### Option 1: Automatic Deployment (Recommended)

#### Via Git Push to Main

1. **Ensure all checks pass:**
   ```bash
   npm run check
   npm audit
   npm run build:client
   ```

2. **Commit and push to main:**
   ```bash
   git add .
   git commit -m "chore: deploy version X.Y.Z"
   git push origin main
   ```

3. **Monitor deployment:**
   - Go to: https://github.com/pinkycollie/NegraRosa/actions
   - Watch "Deploy to GitHub Pages" workflow
   - Verify green checkmark

4. **Verify deployment:**
   - Visit: https://pinkycollie.github.io/NegraRosa/
   - Test all routes
   - Check browser console for errors
   - Test key functionality

### Option 2: Manual Workflow Trigger

1. **Go to Actions:**
   https://github.com/pinkycollie/NegraRosa/actions

2. **Select workflow:**
   - Click "Deploy to GitHub Pages"

3. **Run workflow:**
   - Click "Run workflow"
   - Select branch: `main`
   - Click "Run workflow" button

4. **Monitor and verify** (same as above)

---

## Post-Deployment Verification

### 1. Immediate Checks (< 5 minutes)

#### Site Accessibility
- [ ] Site loads at: https://pinkycollie.github.io/NegraRosa/
- [ ] No 404 errors
- [ ] No console errors
- [ ] HTTPS working (green padlock)

#### Core Functionality
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] All pages accessible:
  - [ ] Home (/)
  - [ ] For Organizations (/mainframe)
  - [ ] Individual ID (/individual-id)
  - [ ] Pricing (/pricing)
  - [ ] Accessibility (/accessibility)
  - [ ] Webhooks (/webhooks)
  - [ ] Demo (/demo)
  - [ ] Login (/login)
  - [ ] Sitemap (/sitemap)

#### Visual Checks
- [ ] Images load correctly
- [ ] Icons display properly
- [ ] Styles applied correctly
- [ ] Responsive design works
- [ ] Mobile layout looks good

### 2. Functional Testing (< 15 minutes)

#### User Flows
- [ ] Navigation between pages works
- [ ] Dropdown menus function
- [ ] Forms render correctly
- [ ] Buttons are clickable
- [ ] Links point to correct destinations
- [ ] SPA routing works (no full page reloads)

#### Components
- [ ] Dashboard loads
- [ ] Widgets render
- [ ] Modals open/close
- [ ] Tooltips display
- [ ] Animations play smoothly

#### Accessibility Features
- [ ] Voice guidance component loads
- [ ] Language selector works
- [ ] Support bubble functions
- [ ] Easter eggs trigger correctly

### 3. Performance Testing (< 10 minutes)

#### Load Times
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 4s
- [ ] Lighthouse score > 90 (performance)

#### Network
- [ ] Check Network tab for errors
- [ ] Verify asset caching
- [ ] Check total page weight
- [ ] Verify gzip compression

#### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

### 4. Security Verification (< 10 minutes)

#### Headers
- [ ] HTTPS enforced
- [ ] Content-Security-Policy (if configured)
- [ ] No sensitive data exposed

#### API Calls
- [ ] API endpoints use HTTPS
- [ ] No API keys in client code
- [ ] CORS configured correctly

#### Secrets
- [ ] No secrets in source code
- [ ] No secrets in browser devtools
- [ ] Environment variables not exposed

---

## Rollback Procedure

If issues are found after deployment:

### Option 1: Revert Commit

```bash
# Revert the last commit
git revert HEAD

# Push to trigger new deployment
git push origin main
```

### Option 2: Revert to Previous Commit

```bash
# Find the last working commit
git log --oneline

# Reset to that commit
git reset --hard <commit-hash>

# Force push (use with caution!)
git push origin main --force
```

### Option 3: Disable GitHub Pages

1. Go to: Repository Settings → Pages
2. Source: None
3. Site will be taken down immediately

### Option 4: Hotfix

1. Create hotfix branch
2. Make minimal fix
3. Fast-track review
4. Merge and deploy

---

## Monitoring & Alerts

### Immediate Post-Deployment (First Hour)

- [ ] Monitor GitHub Actions for failures
- [ ] Check error tracking (if configured)
- [ ] Review analytics for traffic spikes
- [ ] Monitor social media for user reports
- [ ] Check support channels for issues

### First 24 Hours

- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Monitor user feedback
- [ ] Review analytics data
- [ ] Check security alerts

### First Week

- [ ] Weekly security scan results
- [ ] Performance trend analysis
- [ ] User feedback summary
- [ ] Accessibility reports
- [ ] Analytics review

---

## Deployment Notes Template

Use this template for each deployment:

```markdown
## Deployment: [Version Number] - [Date]

### Deployed By
[Your Name]

### Deployment Type
- [ ] Automatic (push to main)
- [ ] Manual (workflow trigger)
- [ ] Hotfix

### Changes Included
- [List major changes]
- [Link to PR or commit]

### Pre-Deployment Checks
- [ ] Security scan passed
- [ ] Build successful
- [ ] Tests passed
- [ ] Documentation updated

### Deployment Time
- Start: [Time]
- Finish: [Time]
- Duration: [X minutes]

### Verification
- [ ] Site accessible
- [ ] All routes working
- [ ] No console errors
- [ ] Performance acceptable

### Issues Found
- [List any issues]
- [Link to tickets]

### Rollback Required
- [ ] Yes - [Reason]
- [ ] No

### Notes
[Any additional notes or observations]
```

---

## Emergency Contacts

### During Deployment Issues

1. **Primary:** Security Council (see SECURITY_STATUS.md)
2. **Secondary:** Repository maintainers
3. **GitHub Status:** https://www.githubstatus.com/

### Escalation Path

1. **Level 1:** Self-resolve using this checklist
2. **Level 2:** Contact team lead
3. **Level 3:** Contact Security Council
4. **Level 4:** Emergency rollback

---

## Deployment Schedule

### Recommended Deployment Windows

**Best Times (Low Traffic):**
- Tuesday - Thursday
- 10:00 AM - 2:00 PM UTC
- Avoid Fridays and weekends

**Avoid Deploying During:**
- High traffic periods
- End of quarter/year
- Major holidays
- Active incidents

### Deployment Frequency

- **Hotfixes:** As needed (within 4 hours)
- **Regular updates:** 1-2 times per week
- **Major releases:** Monthly
- **Security patches:** Immediately

---

## Compliance & Audit

### Deployment Audit Trail

Record each deployment in:
- [ ] Git commit history
- [ ] GitHub Actions logs
- [ ] Deployment notes document
- [ ] Change management system

### Required Documentation

- [ ] Deployment notes completed
- [ ] Changes documented in CHANGELOG
- [ ] Security review completed
- [ ] Stakeholders notified

---

## Optimization Checklist

### Before Each Deployment

- [ ] Run bundle analyzer
- [ ] Check for unused dependencies
- [ ] Optimize images
- [ ] Minimize bundle size
- [ ] Review code splitting

### Quarterly Optimization

- [ ] Update dependencies
- [ ] Review and remove unused code
- [ ] Optimize database queries
- [ ] Review and update caching strategy
- [ ] Analyze performance metrics

---

## Appendix: Common Issues & Solutions

### Build Fails

**Issue:** `npm run build:client` fails  
**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build:client
```

### Assets Not Loading

**Issue:** Images/CSS not loading on GitHub Pages  
**Solution:**
- Check base path in vite.config.ts (should be './')
- Verify assets copied to dist/public
- Check file paths are relative

### 404 on Routes

**Issue:** Direct URL navigation gives 404  
**Solution:**
- Verify 404.html exists in dist/public
- Check deploy workflow copies 404.html
- Test SPA routing handler

### Environment Variables Not Working

**Issue:** API calls failing  
**Solution:**
- For GitHub Pages: Variables must be in client code at build time
- Check import.meta.env.VITE_* prefix
- Verify variables in GitHub Secrets
- Check workflow passes variables to build

---

## Quick Reference Commands

```bash
# Install dependencies
npm ci

# Type check
npm run check

# Security audit
npm audit

# Build for production
npm run build:client

# Preview build locally
npm run preview

# Check build output
ls -la dist/public
du -sh dist/public

# Git deployment
git add .
git commit -m "deploy: version X.Y.Z"
git push origin main
```

---

**Checklist Version:** 1.0  
**Last Updated:** December 21, 2025  
**Next Review:** March 21, 2026
