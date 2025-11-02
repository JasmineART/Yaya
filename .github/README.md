# GitHub Actions Setup for Yaya Starchild

## 🎯 Overview

This directory contains automated workflows for continuous integration and deployment (CI/CD) of the Yaya Starchild website.

## 📁 Workflow Files

### 1. `deploy.yml` - Main Deployment Pipeline
**Triggers:** Push to `main` branch, manual dispatch

**Jobs:**
1. **Validate** - Code quality checks
   - HTML syntax validation
   - JavaScript syntax validation
   - Product data structure validation
   - File size monitoring
   - Critical files verification

2. **Build** - Production build
   - Install dependencies
   - Remove test files
   - Build static site
   - Verify critical files

3. **Deploy** - GitHub Pages deployment
   - Upload production artifact
   - Deploy to GitHub Pages
   - Report deployment URL

4. **Smoke Test** - Post-deployment validation
   - Test homepage accessibility
   - Test shop page accessibility
   - Verify critical assets loaded

### 2. `pr-validation.yml` - Pull Request Validation
**Triggers:** Pull request opened/updated to `main`

**Checks:**
- ✅ HTML syntax and structure
- ✅ JavaScript syntax
- ✅ No console.log spam (warnings)
- ✅ Product data integrity
- ✅ File size limits
- ✅ Build process succeeds
- ✅ Critical files present
- ✅ No sensitive data (API keys, passwords)

**Result:** PR cannot merge if validation fails

## 🔧 Setup Instructions

### Initial Setup (One Time)

1. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - Save

2. **Configure Permissions**
   - Go to Settings → Actions → General
   - Workflow permissions: Read and write permissions
   - Allow GitHub Actions to create PRs: ✅
   - Save

3. **Verify Secrets** (if needed)
   - Go to Settings → Secrets and variables → Actions
   - Add any required secrets (currently none needed)

### Testing the Setup

1. **Test PR Validation**
   ```bash
   git checkout -b test/validation
   git push origin test/validation
   # Create PR on GitHub
   # Watch Actions tab for validation
   ```

2. **Test Deployment**
   ```bash
   git checkout main
   git push origin main
   # Watch Actions tab for deployment
   ```

## 📊 Workflow Status

Check workflow status at:
```
https://github.com/JasmineART/Yaya/actions
```

## 🚨 Troubleshooting

### Workflow Not Running
- Check if GitHub Actions is enabled in repository settings
- Verify workflow file syntax (YAML formatting)
- Check repository permissions

### Deployment Fails
**Common Issues:**
1. Missing permissions → Fix in Settings → Actions
2. Invalid YAML → Check workflow file syntax
3. Build errors → Run `npm run validate` locally
4. Missing files → Check critical files list

### PR Validation Fails
1. Run `npm run validate` locally to see errors
2. Fix errors shown in validation output
3. Push fixes to PR branch
4. Validation re-runs automatically

### Pages Not Updating
1. Wait 2-3 minutes for propagation
2. Check Actions tab for deployment status
3. Clear browser cache (Ctrl+Shift+R)
4. Verify Pages settings in repository

## 🔄 Workflow Diagram

```
┌─────────────────────────────────────────────┐
│          CODE PUSHED TO MAIN                │
└────────────────┬────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │   VALIDATE    │  ← Check code quality
         │  - HTML/JS    │
         │  - Products   │
         │  - Sizes      │
         └───────┬───────┘
                 │ ✅ Pass
                 ▼
         ┌───────────────┐
         │     BUILD     │  ← Create production
         │  - npm ci     │
         │  - Clean up   │
         │  - Build      │
         └───────┬───────┘
                 │ ✅ Pass
                 ▼
         ┌───────────────┐
         │    DEPLOY     │  ← Publish to Pages
         │  - Upload     │
         │  - Publish    │
         └───────┬───────┘
                 │ ✅ Pass
                 ▼
         ┌───────────────┐
         │  SMOKE TEST   │  ← Verify live site
         │  - Check URLs │
         │  - Assets OK  │
         └───────────────┘
                 │
                 ▼
            🎉 SUCCESS!
```

## 📋 Validation Checklist

The automated validation checks:

**HTML Files:**
- [ ] Valid DOCTYPE declaration
- [ ] Proper HTML structure
- [ ] Title tags present
- [ ] Viewport meta tags (mobile friendly)

**JavaScript Files:**
- [ ] No syntax errors
- [ ] Key functions present
- [ ] Not too many console.log statements

**Product Data:**
- [ ] PRODUCTS array exists
- [ ] formatPrice function exists
- [ ] renderProductsGrid function exists

**Security:**
- [ ] No Stripe secret keys
- [ ] No hardcoded passwords
- [ ] No API secrets

**Build:**
- [ ] Dependencies install
- [ ] Build completes successfully
- [ ] Critical files present
- [ ] Test files removed

## 🎯 Best Practices

1. **Always use PRs** - Don't push directly to main
2. **Run local validation** - `npm run validate` before pushing
3. **Monitor Actions** - Watch workflow progress
4. **Fix failures quickly** - Don't let broken builds sit
5. **Keep workflows updated** - Review periodically

## 📈 Metrics

Track deployment success:
- Deployment frequency: Every push to `main`
- Average deployment time: 2-3 minutes
- Validation coverage: 6 quality gates
- Automated tests: 3 smoke tests post-deploy

## 🔗 Related Files

- `/validate-deploy.js` - Local validation script
- `/package.json` - NPM scripts
- `/.deployignore` - Files excluded from deployment
- `/DEPLOYMENT_WORKFLOW.md` - User guide

## 📞 Support

If workflows fail:
1. Check Actions tab for detailed logs
2. Run `npm run validate` locally
3. Review error messages
4. Fix issues and push again

---

**Last Updated:** November 2, 2025
**Workflows Version:** 1.0
**Maintained By:** GitHub Actions
